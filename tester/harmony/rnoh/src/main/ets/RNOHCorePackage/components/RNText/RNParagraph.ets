import { RNOHContext, convertColorSegmentsToString } from '../../../RNOH'
import { RNViewBase } from '../RNViewBase'
import type { PositionedFragment} from '../../../ParagraphMeasurer';
import { PositionedLine, Size, } from '../../../ParagraphMeasurer'
import { RNParagraphManager } from './RNParagraphManager'
import type { CustomComponentBuilder } from '../RNComponentFactory'
import { RNComponentFactory } from '../RNComponentFactory'
import { TextDescriptor, TextFragmentExtraData } from './types'
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
  public ctx!: RNOHContext
  public tag: number = 0
  @BuilderParam buildCustomComponent!: CustomComponentBuilder
  //--------------------------------------------------------------------------------------------------------------------
  @State descriptor: TextDescriptor = {} as TextDescriptor
  @State positionedLines: PositionedLine<TextFragmentExtraData>[] = []
  @State paragraphSize: Size = { width: 0, height: 0 }
  private unregisterDescriptorChangesListener?: () => void = undefined
  private unregisterComponentManager?: () => void = undefined
  private componentManager!: RNParagraphManager

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
      ForEach(this.positionedLines, (line: PositionedLine) => {
        ForEach(line.positionedFragments, (positionedFragment: PositionedFragment<TextFragmentExtraData>) => {
          if (positionedFragment.fragment.type === "text") {
            Text(capitalizeTextIfNecessary(positionedFragment.fragment.content, positionedFragment.fragment.extraData.textTransform))
              .fontColor(positionedFragment.fragment.extraData.fontColor)
              .fontWeight(positionedFragment.fragment.extraData.fontWeight)
              .fontSize(positionedFragment.fragment.extraData.fontSize)
              .fontStyle(stringToFontStyle(positionedFragment.fragment.extraData.fontStyle))
              .decoration({
                type: getTextDecorationLine(positionedFragment.fragment.extraData.textDecorationLine),
                color: convertColorSegmentsToString(positionedFragment.fragment.extraData.textDecorationColor)
              })
              .backgroundColor(positionedFragment.fragment.extraData.backgroundColor)
              .letterSpacing(getLetterSpacing(positionedFragment.fragment.extraData.letterSpacing))
              .lineHeight(line.size.height)
              .textCase(stringToTextTransform(positionedFragment.fragment.extraData.textTransform))
              .textShadow(getTextShadow(positionedFragment.fragment.extraData?.textShadowProps))
              .position({
                x: line.positionRelativeToParagraph.x + positionedFragment.positionRelativeToLine.x,
                y: line.positionRelativeToParagraph.y + positionedFragment.positionRelativeToLine.y + this.getVerticalOffset()
              })
              .width(positionedFragment.size.width)
              .height(line.size.height)
          }
        })
        ForEach(this.descriptor.childrenTags, (childrenTag) => {
          RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
        }, childrenTag => childrenTag)
      })
    }
  }
}