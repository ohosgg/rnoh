import TextMeasurer, {MeasureOptions} from '@ohos.measure';
import {
  ParagraphMeasurer,
  UnhyphenatedWordWrapStrategy,
  Fragment as ParagraphMeasurerFragment,
  TextFragmentMeasurer,
  TextFragment,
} from '../ParagraphMeasurer';

export type Fragment = {
  string: string;
  textAttributes: {
    fontSize: number;
    lineHeight: null | number;
    letterSpacing: null | number;
    fontWeight?: number;
  };
};

export type AttributedString = {
  string: string;
  fragments: Fragment[];
};

export type ParagraphAttributes = {
  maximumNumberOfLines: number;
};

export type Size = {
  width: number;
  height: number;
};

export type LayoutConstrains = {
  maximumSize: Size;
};

declare function px2vp(value: number): number;

interface TextLayoutManager {
  measureParagraph(
    attributedString: AttributedString,
    paragraphAttributes: ParagraphAttributes,
    layoutConstraints: LayoutConstrains,
  ): Size;
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
): Size {
  return createTextLayoutManager(attributedString.fragments).measureParagraph(
    attributedString,
    paragraphAttributes,
    layoutConstraints,
  );
}

function createTextLayoutManager(fragments: Fragment[]): TextLayoutManager {
  if (fragments.length <= 1) {
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
  ): Size {
    if (attributedString.fragments.length === 0) {
      return {width: 0, height: 0};
    }
    if (attributedString.fragments.length > 1) {
      throw new Error('SimpleTextLayoutManager supports only one fragment');
    }
    const fragment = attributedString.fragments[0];
    const measureOptions: MeasureOptions = {
      textContent: fragment.string,
      fontSize: fragment.textAttributes.fontSize,
      lineHeight:
        fragment.textAttributes.lineHeight ||
        fragment.textAttributes.fontSize * (1 + DEFAULT_LINE_SPACING),
      fontWeight: fragment.textAttributes.fontWeight,
      maxLines: paragraphAttributes.maximumNumberOfLines || undefined,
      letterSpacing: fragment.textAttributes.letterSpacing || undefined,
    };
    let textSize = TextMeasurer.measureTextSize(measureOptions) as Size;
    textSize = {width: px2vp(textSize.width), height: px2vp(textSize.height)};
    if (textSize.width < layoutConstraints.maximumSize.width) {
      return textSize;
    }
    /**
     * Measuring text twice, because if constraintWidth is provided, and text is smaller than that width,
     * the width is equal to constraintWidth.
     */
    textSize = TextMeasurer.measureTextSize({
      ...measureOptions,
      constraintWidth: layoutConstraints.maximumSize.width,
    }) as Size;
    textSize = {width: px2vp(textSize.width), height: px2vp(textSize.height)};
    return textSize;
  }
}

class AdvancedTextLayoutManager implements TextLayoutManager {
  constructor(
    private paragraphMeasurer: ParagraphMeasurer,
    private textFragmentMeasurer: TextFragmentMeasurer<OHOSMeasurerTextFragmentExtraData>,
  ) {}

  public measureParagraph(
    attributedString: AttributedString,
    paragraphAttributes: ParagraphAttributes,
    layoutConstraints: LayoutConstrains,
  ): Size {
    const fragments = this.mapRNFragmentsToParagraphMeasurerFragments(
      attributedString.fragments,
    );
    const measuredParagraph = this.paragraphMeasurer.measureParagraph(
      {fragments},
      {
        wordWrapStrategy: new UnhyphenatedWordWrapStrategy(
          this.textFragmentMeasurer,
        ),
        containerConfig: {width: layoutConstraints.maximumSize.width},
      },
    );
    return measuredParagraph.size;
  }

  private mapRNFragmentsToParagraphMeasurerFragments(
    fragments: Fragment[],
  ): ParagraphMeasurerFragment<OHOSMeasurerTextFragmentExtraData>[] {
    return fragments.map(fragment => {
      return {
        type: 'text',
        content: fragment.string,
        extraData: {
          fontSize: fragment.textAttributes.fontSize,
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
  letterSpacing?: number;
  fontWeight?: number;
  lineHeight?: number;
};

export class OHOSTextFragmentMeasurer
  implements TextFragmentMeasurer<OHOSMeasurerTextFragmentExtraData>
{
  public measureTextFragment(textFragment: TextFragment<OHOSMeasurerTextFragmentExtraData>): Size {
    const size = TextMeasurer.measureTextSize({
      textContent: textFragment.content,
      fontSize: textFragment.extraData.fontSize,
      lineHeight: textFragment.extraData.lineHeight,
      fontWeight: textFragment.extraData.fontWeight,
      letterSpacing: textFragment.extraData.letterSpacing,
    }) as Size;
    return {width: px2vp(size.width), height: px2vp(size.height)};
  }
}
