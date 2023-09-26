import { RNOHContext, convertColorSegmentsToString } from '../../../RNOH'
import { RNViewBase } from '../RNViewBase'
import { getLetterSpacing, AttributedFragment, TextDescriptor, EllipsizeMode } from './RNSimpleText'
import { OHOSTextFragmentMeasurer, OHOSMeasurerTextFragmentExtraData } from '../../../RNOH'
import {
  ParagraphMeasurer,
  Fragment as MeasurerFragment,
  UnhyphenatedWordWrapStrategy,
  PositionedFragment,
  PositionedLine
} from '../../../ParagraphMeasurer'

type TextFragmentExtraData = OHOSMeasurerTextFragmentExtraData & {
  fontColor?: string
  backgroundColor?: string
}

function calculateFragmentsLayout(textDescriptor: TextDescriptor): PositionedLine<TextFragmentExtraData>[] {
  const paragraphMeasurer = new ParagraphMeasurer()
  const fragments = mapAttributedFragmentsToMeasurerFragments(textDescriptor.props.fragments)
  return paragraphMeasurer.measureParagraph({ fragments }, {
    containerConfig: { width: textDescriptor.layoutMetrics.frame.size.width },
    wordWrapStrategy: new UnhyphenatedWordWrapStrategy(new OHOSTextFragmentMeasurer())
  }).positionedLines
}

function mapAttributedFragmentsToMeasurerFragments(attributedFragments: AttributedFragment[]): MeasurerFragment<TextFragmentExtraData>[] {
  return attributedFragments.map(attributedFragment => {
    return {
      type: "text",
      content: attributedFragment.text,
      extraData: {
        fontSize: attributedFragment.fontSize,
        letterSpacing: attributedFragment.letterSpacing || undefined,
        fontWeight: attributedFragment.fontWeight,
        lineHeight: attributedFragment.lineHeight || undefined,
        fontColor: convertColorSegmentsToString(attributedFragment.fontColor),
        backgroundColor: convertColorSegmentsToString(attributedFragment.backgroundColor)
      }
    }
  })
}

@Component
export struct RNParagraph {
  public ctx: RNOHContext
  public tag: number
  //--------------------------------------------------------------------------------------------------------------------
  @State descriptor: TextDescriptor = {} as TextDescriptor
  @State positionedLines: PositionedLine<TextFragmentExtraData>[] = []
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.onDescriptorChange(this.ctx.descriptorRegistry.getDescriptor<TextDescriptor>(this.tag))
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor as TextDescriptor)
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  onDescriptorChange(newDescriptor: TextDescriptor) {
    this.positionedLines = calculateFragmentsLayout(newDescriptor)
    this.descriptor = newDescriptor
  }

  getMaxLines() {
    const maxLines = this.descriptor.props.maximumNumberOfLines
    return (maxLines ?? 0) > 0 ? maxLines : undefined
  }

  getTextOverflow(): TextOverflow {
    if (this.descriptor.props.ellipsizeMode === EllipsizeMode.Clip) {
      return TextOverflow.Clip
    }
    return TextOverflow.Ellipsis
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      ForEach(this.positionedLines, ({ positionedFragments, positionRelativeToParagraph, size: lineSize }: PositionedLine) => {
        ForEach(positionedFragments, ({ fragment, positionRelativeToLine, size }: PositionedFragment<TextFragmentExtraData>) => {
          if (fragment.type === "text") {
            Text(fragment.content)
              .fontColor(fragment.extraData.fontColor)
              .fontWeight(fragment.extraData.fontWeight)
              .fontSize(fragment.extraData.fontSize)// .fontStyle(stringToFontStyle(fragment.fontStyle))
                // .decoration({
                //   type: getTextDecorationLine(fragment),
                //   color: convertColorSegmentsToString(fragment.textDecorationColor)
                // })
              .backgroundColor(fragment.extraData.backgroundColor)
              .letterSpacing(getLetterSpacing(fragment.extraData.letterSpacing))
              .lineHeight(lineSize.height)
              .position({
                x: positionRelativeToParagraph.x + positionRelativeToLine.x,
                y: positionRelativeToParagraph.y + positionRelativeToLine.y
              })
              .width(size.width)
              .height(lineSize.height)
          }
        })
      })
    }
  }
}