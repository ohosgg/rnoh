import type {
  PlaceholderFragment,
  MeasuredParagraph,
  Fragment as MeasurerFragment} from '../../../ParagraphMeasurer';
import {
  ParagraphMeasurer,
  UnhyphenatedWordWrapStrategy,
  TailEllipsisInserter
} from '../../../ParagraphMeasurer';
import type { RNOHContext } from '../../../RNOH';
import { convertColorSegmentsToString, OHOSTextFragmentMeasurer, PLACEHOLDER_SYMBOL } from '../../../RNOH';
import type { Tag } from '../../../RNOH/DescriptorBase';
import { RNViewManager } from '../../componentManagers/RNViewManager';
import type { AttributedFragment, TextDescriptor, TextFragmentExtraData } from './types';

/**
 * AdvancedTextLayoutManager is executed twice per paragraph. For the first time, when RN measures the bounding box of
 * the paragraph and attachment positions, the second time when RNParagraph is rendered to handle wrapping.
 * The difference between the two measurements is containerWidth. First containerWidth is equal to the parent's width.
 * The second containerWidth receives the width from the measured bounding box. However, these two values aren't always
 * equal. The second containerWidth may be smaller because of precision lost. RN operates on float's and JS numbers are
 * doubles. In such situations, unnecessary wrapping happens. To prevent that, this constant is added to the container
 * width.
 */
const ACCEPTABLE_SIZE_OF_TEXT_EXCEEDING_CONTAINER = 0.01

export class RNParagraphManager extends RNViewManager {
  constructor(
    tag: Tag,
    ctx: RNOHContext,
  ) {
    super(tag, ctx);
  }

  private mapAttributedFragmentsToMeasurerFragments(attributedFragments: AttributedFragment[]): MeasurerFragment<TextFragmentExtraData>[] {
    return attributedFragments.map(attributedFragment => {
      if (attributedFragment.text === PLACEHOLDER_SYMBOL) {
        const placeholder: PlaceholderFragment = {
          type: "placeholder",
          width: attributedFragment.parentShadowView.layoutMetrics.frame.size.width,
          height: attributedFragment.parentShadowView.layoutMetrics.frame.size.height,
          extraData: {
            tag: attributedFragment.parentShadowView.tag
          }
        }
        return placeholder
      }
      return {
        type: "text",
        content: attributedFragment.text,
        extraData: {
          backgroundColor: convertColorSegmentsToString(attributedFragment.backgroundColor),
          fontColor: convertColorSegmentsToString(attributedFragment.fontColor),
          fontSize: attributedFragment.fontSize,
          fontStyle: attributedFragment.fontStyle,
          textDecorationColor: attributedFragment.textDecorationColor,
          textDecorationLine: attributedFragment.textDecorationLine,
          fontWeight: attributedFragment.fontWeight,
          letterSpacing: attributedFragment.letterSpacing || undefined,
          lineHeight: attributedFragment.lineHeight || undefined,
          textTransform: attributedFragment.textTransform,
          textShadowProps: attributedFragment.textShadowProps,
        }
      }
    })
  }

  public createLayout(textDescriptor: TextDescriptor): MeasuredParagraph {
    const paragraphMeasurer = new ParagraphMeasurer()
    const fragments = this.mapAttributedFragmentsToMeasurerFragments(textDescriptor.props.fragments)
    const textFragmentMeasurer = new OHOSTextFragmentMeasurer()
    return paragraphMeasurer.measureParagraph({ fragments }, {
      containerConfig: {
        width: textDescriptor.layoutMetrics.frame.size.width + ACCEPTABLE_SIZE_OF_TEXT_EXCEEDING_CONTAINER,
        horizontalAlignment: ({
          left: 'start',
          center: 'center',
          right: 'end'
        } as const)[textDescriptor.props.textAlign ?? "left"],
        maxNumberOfLines: textDescriptor.props.maximumNumberOfLines || undefined
      },
      wordWrapStrategy: new UnhyphenatedWordWrapStrategy(textFragmentMeasurer),
      ellipsisInserter: new TailEllipsisInserter(textFragmentMeasurer)
    })
  }
}