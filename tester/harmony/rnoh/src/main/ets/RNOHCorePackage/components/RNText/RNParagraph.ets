import { RNOHContext, convertColorSegmentsToString, Tag } from '../../../RNOH'
import { RNViewBase } from '../RNViewBase'
import { PositionedFragment } from '../../../ParagraphMeasurer';
import { PositionedLine, Size, } from '../../../ParagraphMeasurer'
import { RNParagraphManager } from './RNParagraphManager'
import { CustomComponentBuilder } from '../RNComponentFactory'
import { RNComponentFactory, buildRNComponent } from '../RNComponentFactory'
import { TextDescriptor, TextFragmentExtraData } from './types'
import { ViewDescriptorWrapper } from "../RNViewBase"
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
  @State descriptorWrapper: ViewDescriptorWrapper | undefined = undefined
  private componentManager!: RNParagraphManager
  private cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    this.onDescriptorChange(this.ctx.descriptorRegistry.getDescriptor<TextDescriptor>(this.tag))
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor as TextDescriptor)
      }
    ))
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach((cb) => cb())
  }

  onDescriptorChange(newDescriptor: TextDescriptor) {
    const layout = this.componentManager.createLayout(newDescriptor)
    this.positionedLines = layout.positionedLines
    this.paragraphSize = layout.size
    this.descriptor = newDescriptor
    this.descriptorWrapper = new ViewDescriptorWrapper(newDescriptor)
  }

  getVerticalAlignmentOffset() {
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
      componentManager: this.componentManager,
    }) {
      ForEach(this.positionedLines, (line: PositionedLine) => {
        ForEach(line.positionedFragments, (positionedFragment: PositionedFragment<TextFragmentExtraData>) => {
          if (positionedFragment.fragment.type === "text") {
            Text(capitalizeTextIfNecessary(positionedFragment.fragment.content, positionedFragment.fragment.extraData.textTransform))
              .fontColor(positionedFragment.fragment.extraData.fontColor)
              .fontFamily(positionedFragment.fragment.extraData.fontFamily)
              .fontWeight(positionedFragment.fragment.extraData.fontWeight)
              .fontSize(positionedFragment.fragment.extraData.fontSize)
              .fontStyle(stringToFontStyle(positionedFragment.fragment.extraData.fontStyle))
              .decoration({
                type: getTextDecorationLine(positionedFragment.fragment.extraData.textDecorationLine),
                color: positionedFragment.fragment.extraData.textDecorationColor
                  ? convertColorSegmentsToString(positionedFragment.fragment.extraData.textDecorationColor)
                  : positionedFragment.fragment.extraData.fontColor
              })
              .backgroundColor(positionedFragment.fragment.extraData.backgroundColor)
              .letterSpacing(getLetterSpacing(positionedFragment.fragment.extraData.letterSpacing))
              .textCase(stringToTextTransform(positionedFragment.fragment.extraData.textTransform))
              .textShadow(getTextShadow(positionedFragment.fragment.extraData?.textShadowProps))
              .position({
                x: line.positionRelativeToParagraph.x + positionedFragment.positionRelativeToLine.x,
                y: line.positionRelativeToParagraph.y + positionedFragment.positionRelativeToLine.y + this.getVerticalAlignmentOffset()
              })
              .width(positionedFragment.size.width)
              .height(line.size.height)
              .maxLines(1)
              .accessibilityGroup(this.descriptorWrapper?.accessibilityGroup)
              .accessibilityText(this.descriptorWrapper?.accessibilityText)
              .accessibilityLevel(this.descriptorWrapper?.accessibilityLevel)
              .accessibilityDescription(this.descriptorWrapper?.accessibilityDescription)
          }
        })
      })
      if (this.ctx.rnInstance.isFeatureFlagEnabled("USE_BUILD_RN_COMPONENT")) {
        ForEach(this.descriptor.childrenTags, (childrenTag: Tag) => {
          buildRNComponent(this.ctx, this.ctx.descriptorRegistry.findDescriptorWrapperByTag(childrenTag))
        }, (childrenTag: Tag) => childrenTag.toString())
      } else {
        ForEach(this.descriptor.childrenTags, (childrenTag: Tag) => {
          RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
        }, (childrenTag: Tag) => childrenTag.toString())
      }
    }
  }
}