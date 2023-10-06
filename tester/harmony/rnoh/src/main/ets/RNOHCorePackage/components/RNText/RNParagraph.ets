import { RNOHContext, OHOSTextFragmentMeasurer, convertColorSegmentsToString, } from '../../../RNOH'
import { RNViewBase } from '../RNViewBase'
import { PositionedFragment, PositionedLine, Size, } from '../../../ParagraphMeasurer'
import { RNParagraphManager } from './RNParagraphManager'
import { EllipsizeMode, TextDescriptor, TextFragmentExtraData } from './types'
import {
  capitalizeTextIfNecessary,
  getLetterSpacing,
  getTextDecorationLine,
  getTextShadow,
  stringToFontStyle,
  stringToTextTransform
} from './conversions'


@Component
export struct RNParagraph {
  public ctx: RNOHContext
  public tag: number
  @BuilderParam buildChildren: () => void
  //--------------------------------------------------------------------------------------------------------------------
  @State descriptor: TextDescriptor = {} as TextDescriptor
  @State positionedLines: PositionedLine<TextFragmentExtraData>[] = []
  @State paragraphSize: Size = { width: 0, height: 0 }
  private unregisterDescriptorChangesListener?: () => void = undefined
  private unregisterComponentManager?: () => void = undefined
  private componentManager: RNParagraphManager = undefined

  aboutToAppear() {
    this.componentManager = new RNParagraphManager(this.tag, this.ctx)
    this.unregisterComponentManager = this.ctx.componentManagerRegistry.registerComponentManager(this.tag, this.componentManager);
    this.onDescriptorChange(this.ctx.descriptorRegistry.getDescriptor<TextDescriptor>(this.tag))
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor as TextDescriptor)
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
    this.unregisterComponentManager?.();
  }

  onDescriptorChange(newDescriptor: TextDescriptor) {
    const layout = this.componentManager.createLayout(newDescriptor)
    this.positionedLines = layout.positionedLines
    this.paragraphSize = layout.size
    this.descriptor = newDescriptor
  }

  getVerticalOffset() {
    /**
     * TODO: Move handling vertical alignment to ParagraphMeasurer, to fix the position of attachments.
     * https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/392
     */
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
            Text(capitalizeTextIfNecessary(fragment.content, fragment.extraData.textTransform))
              .fontColor(fragment.extraData.fontColor)
              .fontWeight(fragment.extraData.fontWeight)
              .fontSize(fragment.extraData.fontSize)
              .fontStyle(stringToFontStyle(fragment.extraData.fontStyle))
              .decoration({
                type: getTextDecorationLine(fragment.extraData.textDecorationLine),
                color: convertColorSegmentsToString(fragment.extraData.textDecorationColor)
              })
              .backgroundColor(fragment.extraData.backgroundColor)
              .letterSpacing(getLetterSpacing(fragment.extraData.letterSpacing))
              .lineHeight(lineSize.height)
              .textCase(stringToTextTransform(fragment.extraData.textTransform))
              .textShadow(getTextShadow(fragment.extraData?.textShadowProps))
              .position({
                x: positionRelativeToParagraph.x + positionRelativeToLine.x,
                y: positionRelativeToParagraph.y + positionRelativeToLine.y + this.getVerticalOffset()
              })
              .width(size.width)
              .height(lineSize.height)
          }
        })
        this.buildChildren()
      })
    }
  }
}