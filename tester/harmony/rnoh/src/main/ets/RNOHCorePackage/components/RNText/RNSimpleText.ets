import { convertColorSegmentsToString, RNOHContext, DEFAULT_LINE_SPACING, } from '../../../RNOH'
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
  capitalizeTextIfNecessary,
} from './conversions'
import { AttributedFragment } from './types';
import { TextDescriptor } from './types'

@Component
export struct RNSimpleText {
  ctx!: RNOHContext
  tag: number = 0
  @State descriptor: TextDescriptor = {} as TextDescriptor
  @State fragment: AttributedFragment | undefined = undefined
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<TextDescriptor>(this.tag)
    this.updateDescriptor(descriptor);
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => this.updateDescriptor(newDescriptor as TextDescriptor)
    )
  }

  updateDescriptor(newDescriptor: TextDescriptor) {
    this.descriptor = newDescriptor
    this.fragment = newDescriptor.props.fragments[0]
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      Text(this.fragment && capitalizeTextIfNecessary(this.fragment?.text, this.fragment?.textTransform))
        .fontColor(convertColorSegmentsToString(this.fragment?.fontColor))
        .fontFamily(this.fragment?.fontFamily)
        .fontWeight(this.fragment?.fontWeight)
        .fontSize(this.fragment?.fontSize)
        .fontStyle(stringToFontStyle(this.fragment?.fontStyle))
        .decoration({
          type: getTextDecorationLine(this.fragment?.textDecorationLine),
          color: convertColorSegmentsToString(this.fragment?.textDecorationColor ?? this.fragment?.fontColor)
        })
        .lineHeight(this.fragment?.lineHeight || (this.fragment?.fontSize ?? 16) * (DEFAULT_LINE_SPACING + 1))
        .backgroundColor(convertColorSegmentsToString(this.fragment?.backgroundColor))
        .letterSpacing(getLetterSpacing(this.fragment?.letterSpacing))
        .textCase(stringToTextTransform(this.fragment?.textTransform))
        .width("100%")
        .height("100%")
        .maxLines(getMaxLines(this.descriptor.props.maximumNumberOfLines))
        .textShadow(getTextShadow(this.fragment?.textShadowProps))
        .textOverflow({ overflow: ellipsizeModeToTextOverflow(this.descriptor.props.ellipsizeMode) })
        .textAlign(stringToAlignment(this.descriptor.props.textAlign))
        .align(stringToVerticalAlign(this.descriptor.props.textAlignVertical))
        .padding(this.descriptor.props.padding)
        .copyOption(this.descriptor.props.selectable ? CopyOptions.LocalDevice : CopyOptions.None)
        .enabled(!this.descriptor.props.disabled)
    }
  }
}