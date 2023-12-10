import type { MeasuredParagraph, Fragment as MeasurerFragment, PlaceholderFragment } from '../../../ParagraphMeasurer';
import { ParagraphMeasurer, TailEllipsisInserter, UnhyphenatedWordWrapStrategy } from '../../../ParagraphMeasurer';
import {
  convertColorSegmentsToString,
  DEFAULT_LINE_SPACING,
  OHOSTextFragmentMeasurer,
  PLACEHOLDER_SYMBOL,
  RNOHContext,
} from '../../../RNOH';
import type { Tag } from '../../../RNOH/DescriptorBase';
import { RNViewManager } from '../../componentManagers/RNViewManager';
import { RNFragmentManager } from './RNFragmentManager';
import type { AttributedFragment, TextDescriptor, TextFragmentExtraData } from './types';

export class RNParagraphManager extends RNViewManager {
  constructor(
    tag: Tag,
    ctx: RNOHContext,
  ) {
    super(tag, ctx);
    for (let fragment of this.getFragmentsTags()) {
      const fragmentComponentManager = new RNFragmentManager(fragment, ctx, this.tag)
      this.cleanUpCallbacks.push(this.componentManagerRegistry.registerComponentManager(fragment, fragmentComponentManager))
    }
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
          fontFamily: attributedFragment.fontFamily,
          fontSize: attributedFragment.fontSize,
          fontStyle: attributedFragment.fontStyle,
          textDecorationColor: attributedFragment.textDecorationColor,
          textDecorationLine: attributedFragment.textDecorationLine,
          fontWeight: attributedFragment.fontWeight,
          letterSpacing: attributedFragment.letterSpacing || undefined,
          lineHeight: attributedFragment.lineHeight || (attributedFragment.fontSize ?? 16) * (1 + DEFAULT_LINE_SPACING),
          textTransform: attributedFragment.textTransform,
          textShadowProps: attributedFragment.textShadowProps,
          tag: attributedFragment.parentShadowView?.tag,
        }
      }
    })
  }

  public createLayout(textDescriptor: TextDescriptor): MeasuredParagraph {
    const paragraphMeasurer = new ParagraphMeasurer()
    const fragments = this.mapAttributedFragmentsToMeasurerFragments(textDescriptor.props.fragments)
    const textFragmentMeasurer = new OHOSTextFragmentMeasurer()
    const descriptorWrapper = this.getDescriptorWrapper()
    return paragraphMeasurer.measureParagraph({ fragments }, {
      containerConfig: {
        width: textDescriptor.layoutMetrics.frame.size.width,
        padding: {
          top: descriptorWrapper.padding.top.asNumber(),
          left: descriptorWrapper.padding.left.asNumber(),
          right: descriptorWrapper.padding.right.asNumber()
        },
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

  public getActiveChildrenTags(): Tag[] {
    const descriptor = this.getDescriptor() as TextDescriptor;
    // check children tags in reverse order,
    // since the last child is the one on top
    const childrenTags = descriptor.childrenTags.slice().reverse();
    return childrenTags.concat(this.getFragmentsTags().reverse());
  }

  private getFragmentsTags(): Tag[] {
    const descriptor = this.getDescriptor() as TextDescriptor;
    return descriptor.props.fragments.map(fragment => fragment?.parentShadowView?.tag).filter(tag => tag) as number[];
  }
}