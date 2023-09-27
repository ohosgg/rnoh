import {
  RNOHContext,
  convertColorSegmentsToString,
  OHOSTextFragmentMeasurer,
  OHOSMeasurerTextFragmentExtraData
} from '../../../RNOH'
import { RNViewBase } from '../RNViewBase'
import { getLetterSpacing, AttributedFragment, TextDescriptor, EllipsizeMode, } from './RNSimpleText'
import {
  ParagraphMeasurer,
  Fragment as MeasurerFragment,
  UnhyphenatedWordWrapStrategy,
  PositionedFragment,
  PositionedLine,
  Size
} from '../../../ParagraphMeasurer'

type TextFragmentExtraData = OHOSMeasurerTextFragmentExtraData & {
  fontColor?: string
  backgroundColor?: string
}

function createLayout(textDescriptor: TextDescriptor) {
  const paragraphMeasurer = new ParagraphMeasurer()
  const fragments = mapAttributedFragmentsToMeasurerFragments(textDescriptor.props.fragments)
  return paragraphMeasurer.measureParagraph({ fragments }, {
    containerConfig: {
      width: textDescriptor.layoutMetrics.frame.size.width,
      horizontalAlignment: ({
        left: 'start',
        center: 'center',
        right: 'end'
      } as const)[textDescriptor.props.textAlign ?? "left"],
      maxNumberOfLines: textDescriptor.props.maximumNumberOfLines || undefined
    },
    wordWrapStrategy: new UnhyphenatedWordWrapStrategy(new OHOSTextFragmentMeasurer())
  })
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
        backgroundColor: convertColorSegmentsToString(attributedFragment.backgroundColor),
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
  @State paragraphSize: Size = { width: 0, height: 0 }
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
    const layout = createLayout(newDescriptor)
    this.positionedLines = layout.positionedLines
    this.paragraphSize = layout.size
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

  getVerticalOffset() {
    const maxOffset = Math.max(this.descriptor.layoutMetrics.frame.size.height - this.paragraphSize.height, 0)
    switch (this.descriptor.props.textAlignVertical) {
      case "bottom":
        return maxOffset
      case "center":
        return maxOffset / 2
      default:
        return 0
    }
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
                y: positionRelativeToParagraph.y + positionRelativeToLine.y + this.getVerticalOffset()
              })
              .width(size.width)
              .height(lineSize.height)
          }
        })
      })
    }
  }
}