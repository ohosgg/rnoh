import type { MeasureOptions } from '@ohos.measure';
import TextMeasurer from '@ohos.measure';
import type { Tag } from './DescriptorBase';
import type { Size } from './types';
import type {
  Fragment as ParagraphMeasurerFragment,
  PlaceholderFragment,
  TextFragment,
  TextFragmentMeasurer
} from '../ParagraphMeasurer';
import { ParagraphMeasurer, UnhyphenatedWordWrapStrategy } from '../ParagraphMeasurer';

export const PLACEHOLDER_SYMBOL = '￼' as const;

export type Fragment = {
  string: string;
  textAttributes: {
    fontSize: number;
    fontFamily?: string;
    lineHeight: null | number;
    letterSpacing: null | number;
    fontWeight?: number;
  };
  parentShadowView?: {
    tag: Tag;
    layoutMetrics: {
      frame: {
        size: {
          width: number;
          height: number;
        };
      };
    };
  };
};

export type AttributedString = {
  string: string;
  fragments: Fragment[];
};

export type ParagraphAttributes = {
  maximumNumberOfLines: number;
};

export type LayoutConstrains = {
  maximumSize: Size;
};

declare function px2vp(value: number): number;

export type AttachmentLayout = {
  positionRelativeToContainer: {
    x: number;
    y: number;
  };
  size: Size;
};

export type ParagraphMeasurement = {
  size: Size;
  attachmentLayouts: AttachmentLayout[];
};

interface TextLayoutManager {
  measureParagraph(
    attributedString: AttributedString,
    paragraphAttributes: ParagraphAttributes,
    layoutConstraints: LayoutConstrains,
  ): ParagraphMeasurement;
}

// ---------------------------------------------------------------------------------------------------------------------

/**
 * 15% of font size
 */
export const DEFAULT_LINE_SPACING = 0.15;

export function measureParagraph(
  attributedString: AttributedString,
  paragraphAttributes: ParagraphAttributes,
  layoutConstraints: LayoutConstrains,
): ParagraphMeasurement {
  const result = createTextLayoutManager(attributedString.fragments).measureParagraph(
    attributedString,
    paragraphAttributes,
    layoutConstraints,
  );

  /**
   * RN operates on floats while JS numbers are doubles and that causes loss of precision.
   * After text measuring the value passed to the RN sometimes becomes smaller than the actual measured value.
   * This causes views to render with smaller size values than measured in JS and
   * makes them misaligned in respect to other components. It also causes some unnecessary text wrapping.
   * To prevent that we round up the measured values to ensure that the containing view will not be smaller
   * than its children.
   *
   */
  const magicNumber = 0.01
  const roundingHelperValue = 100
  const roundedResult: ParagraphMeasurement = {
    size: {
      height: (Math.ceil(result.size.height * roundingHelperValue) / roundingHelperValue) + magicNumber,
      width: (Math.ceil(result.size.width * roundingHelperValue) / roundingHelperValue) + magicNumber
    },
    attachmentLayouts: result.attachmentLayouts
  }
  return roundedResult;
}

function createTextLayoutManager(fragments: Fragment[]): TextLayoutManager {
  const shouldCreateSpaceForAttachment = fragments.some(fragment => fragment.string === PLACEHOLDER_SYMBOL)
  if (fragments.length <= 1 && !shouldCreateSpaceForAttachment) {
    return new SimpleTextLayoutManager();
  }
  return new AdvancedTextLayoutManager(
    new ParagraphMeasurer(),
    new OHOSTextFragmentMeasurer(),
  );
}


class SimpleTextLayoutManager implements TextLayoutManager {
  public measureParagraph(
    attributedString: AttributedString,
    paragraphAttributes: ParagraphAttributes,
    layoutConstraints: LayoutConstrains,
  ): ParagraphMeasurement {
    if (attributedString.fragments.length === 0) {
      return { size: { width: 0, height: 0 }, attachmentLayouts: [] };
    }
    if (attributedString.fragments.length > 1) {
      throw new Error('SimpleTextLayoutManager supports only one fragment');
    }
    const fragment = attributedString.fragments[0];
    const measureOptions: MeasureOptions = {
      textContent: fragment.string,
      fontSize: fragment.textAttributes.fontSize,
      fontFamily: fragment.textAttributes.fontFamily,
      lineHeight:
      fragment.textAttributes.lineHeight ||
        fragment.textAttributes.fontSize * (1 + DEFAULT_LINE_SPACING),
      fontWeight: fragment.textAttributes.fontWeight,
      maxLines: paragraphAttributes.maximumNumberOfLines || undefined,
      letterSpacing: fragment.textAttributes.letterSpacing || undefined,
    };
    let textSize = TextMeasurer.measureTextSize(measureOptions) as Size;
    textSize = { width: px2vp(textSize.width), height: px2vp(textSize.height) };
    if (textSize.width < layoutConstraints.maximumSize.width) {
      return { size: textSize, attachmentLayouts: [] };
    }
    /**
     * Measuring text twice, because if constraintWidth is provided, and text is smaller than that width,
     * the width is equal to constraintWidth.
     */
    textSize = TextMeasurer.measureTextSize({
      ...measureOptions,
      constraintWidth: layoutConstraints.maximumSize.width,
    }) as Size;
    textSize = { width: px2vp(textSize.width), height: px2vp(textSize.height) };
    return { size: textSize, attachmentLayouts: [] };
  }
}

class AdvancedTextLayoutManager implements TextLayoutManager {
  constructor(
    private paragraphMeasurer: ParagraphMeasurer,
    private textFragmentMeasurer: TextFragmentMeasurer<OHOSMeasurerTextFragmentExtraData>,
  ) {
  }

  public measureParagraph(
    attributedString: AttributedString,
    paragraphAttributes: ParagraphAttributes,
    layoutConstraints: LayoutConstrains,
  ): ParagraphMeasurement {
    const fragments = this.mapRNFragmentsToParagraphMeasurerFragments(
      attributedString.fragments,
    );
    const expectedAttachmentCount = fragments.filter(fragment => fragment.type === "placeholder").length
    const measuredParagraph = this.paragraphMeasurer.measureParagraph(
      { fragments },
      {
        wordWrapStrategy: new UnhyphenatedWordWrapStrategy(
          this.textFragmentMeasurer,
        ),
        containerConfig: {
          width: layoutConstraints.maximumSize.width,
          maxNumberOfLines: paragraphAttributes.maximumNumberOfLines,
        },
      },
    );
    const attachmentLayouts = measuredParagraph.positionedLines
      .map(line => {
        return line.positionedFragments
          .map(positionedFragment => {
            if (positionedFragment.fragment.type !== 'placeholder') return [];
            const attachmentLayout: AttachmentLayout = {
              size: {
                width: positionedFragment.size.width,
                height: positionedFragment.size.height,
              },
              positionRelativeToContainer: {
                x:
                positionedFragment.positionRelativeToLine.x +
                line.positionRelativeToParagraph.x,
                y:
                positionedFragment.positionRelativeToLine.y +
                line.positionRelativeToParagraph.y,
              },
            };
            return [attachmentLayout];
          })
          .flat();
      })
      .flat();
    const visibleAttachmentLayoutCount = attachmentLayouts.length
    for (let i = 0; i < expectedAttachmentCount - visibleAttachmentLayoutCount; i++) {
      attachmentLayouts.push({ size: { width: 0, height: 0 }, positionRelativeToContainer: { x: 0, y: 0 } })
    }
    return { size: measuredParagraph.size, attachmentLayouts };
  }

  private mapRNFragmentsToParagraphMeasurerFragments(
    fragments: Fragment[],
  ): ParagraphMeasurerFragment<OHOSMeasurerTextFragmentExtraData>[] {
    return fragments.map(fragment => {
      if (fragment.string === PLACEHOLDER_SYMBOL) {
        const placeholderFragment: PlaceholderFragment = {
          type: 'placeholder',
          width:
          fragment?.parentShadowView?.layoutMetrics?.frame?.size?.width ?? 0,
          height:
          fragment?.parentShadowView?.layoutMetrics?.frame?.size?.height ?? 0,
          extraData: { tag: fragment?.parentShadowView?.tag },
        };
        return placeholderFragment;
      }
      return {
        type: 'text',
        content: fragment.string,
        extraData: {
          fontSize: fragment.textAttributes.fontSize,
          fontFamily: fragment.textAttributes.fontFamily,
          lineHeight:
          fragment.textAttributes.lineHeight ||
            fragment.textAttributes.fontSize * (1 + DEFAULT_LINE_SPACING),
          fontWeight: fragment.textAttributes.fontWeight,
          letterSpacing: fragment.textAttributes.letterSpacing || undefined,
        },
      };
    });
  }
}

export type OHOSMeasurerTextFragmentExtraData = {
  fontSize: number;
  fontFamily?: string;
  letterSpacing?: number;
  fontWeight?: number;
  lineHeight?: number;
};

export class OHOSTextFragmentMeasurer
implements TextFragmentMeasurer<OHOSMeasurerTextFragmentExtraData> {
  private sizeByMeasuredTextFragmentHash = new Map<string, Size>()

  public measureTextFragment(
    textFragment: TextFragment<OHOSMeasurerTextFragmentExtraData>,
  ): Size {
    const cachedSize = this.maybeGetCachedSize(textFragment)
    if (cachedSize) {
      return cachedSize
    }
    let size = TextMeasurer.measureTextSize({
      textContent: textFragment.content,
      fontSize: textFragment.extraData.fontSize,
      fontFamily: textFragment.extraData.fontFamily,
      lineHeight: textFragment.extraData.lineHeight,
      fontWeight: textFragment.extraData.fontWeight,
      letterSpacing: textFragment.extraData.letterSpacing,
    }) as Size;
    // BEGIN: hack
    if (textFragment.content === ":") {
      size.width += 1
    }
    // END: hack
    size = { width: px2vp(size.width), height: px2vp(size.height) };
    this.updateCache(textFragment, size)
    return size;
  }

  private maybeGetCachedSize(textFragment: TextFragment<OHOSMeasurerTextFragmentExtraData>): Size | undefined {
    return this.sizeByMeasuredTextFragmentHash.get(this.calculateTextFragmentHash(textFragment))
  }

  private calculateTextFragmentHash(textFragment: TextFragment<OHOSMeasurerTextFragmentExtraData>): string {
    let hash = textFragment.content + textFragment.extraData.fontSize.toString()
    hash += textFragment.extraData.letterSpacing ?? '-'
    hash += textFragment.extraData.fontWeight ?? '-'
    hash += textFragment.extraData.lineHeight ?? '-'
    hash += textFragment.extraData.fontFamily ?? '-'
    return hash
  }

  private updateCache(textFragment: TextFragment<OHOSMeasurerTextFragmentExtraData>, size: Size) {
    this.sizeByMeasuredTextFragmentHash.set(this.calculateTextFragmentHash(textFragment), size)
  }
}
