import { Descriptor, convertColorSegmentsToString, RNOHContext, DEFAULT_LINE_SPACING, } from '../../../RNOH'
import { RNViewBase } from '../RNViewBase'
import {
  stringToFontStyle,
  getTextDecorationLine,
  stringToAlignment,
  stringToVerticalAlign,
  stringToTextTransform,
  getLetterSpacing,
  getMaxLines,
  ellipsizeModeToTextOverflow,
  getTextShadow,
  capitalizeTextIfNecessary
} from './conversions'
import { AttributedFragment } from './types';
import { TextProps, EllipsizeMode, TextDescriptor } from './types'

@Component
export struct RNSimpleText {
  ctx!: RNOHContext
  tag: number = 0
  @State descriptor: TextDescriptor = {} as TextDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<TextDescriptor>(this.tag)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as TextDescriptor)
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      Text() {
        ForEach(this.descriptor.props.fragments, (fragment: AttributedFragment) => {
          Span(capitalizeTextIfNecessary(fragment.text, fragment.textTransform))
            .fontColor(convertColorSegmentsToString(fragment.fontColor))
            .fontFamily(fragment.fontFamily)
            .fontWeight(fragment.fontWeight)
            .fontSize(fragment.fontSize)
            .fontStyle(stringToFontStyle(fragment.fontStyle))
            .decoration({
              type: getTextDecorationLine(fragment.textDecorationLine),
              color: convertColorSegmentsToString(fragment.textDecorationColor)
            })
            .lineHeight(fragment.lineHeight || (fragment.fontSize ?? 16) * (DEFAULT_LINE_SPACING + 1))
            .backgroundColor(convertColorSegmentsToString(fragment.backgroundColor))// not supported
            .letterSpacing(getLetterSpacing(fragment.letterSpacing))
            .textCase(stringToTextTransform(fragment.textTransform))
        })
      }
      .width("100%")
      .height("100%")
      .maxLines(getMaxLines(this.descriptor.props.maximumNumberOfLines))
      .textShadow(getTextShadow(this.descriptor.props.fragments[0]?.textShadowProps))
      .textOverflow({ overflow: ellipsizeModeToTextOverflow(this.descriptor.props.ellipsizeMode) })
      .textAlign(stringToAlignment(this.descriptor.props.textAlign))
      .align(stringToVerticalAlign(this.descriptor.props.textAlignVertical))
      .padding(this.descriptor.props.padding)
      .copyOption(this.descriptor.props.selectable ? CopyOptions.LocalDevice : CopyOptions.None)
      .enabled(!this.descriptor.props.disabled)
    }
  }
}