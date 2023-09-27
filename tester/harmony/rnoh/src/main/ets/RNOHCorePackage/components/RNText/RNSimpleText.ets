import {
  ColorSegments,
  Descriptor,
  convertColorSegmentsToString,
  RNOHContext,
  DEFAULT_LINE_SPACING
} from '../../../RNOH'
import { ViewBaseProps, RNViewBase } from '../RNViewBase'

export type AttributedFragment = {
  text?: string
  fontColor?: ColorSegments
  fontWeight?: number
  fontSize?: number
  fontStyle?: string
  textDecorationLine?: number
  textDecorationColor?: ColorSegments
  textTransform?: string
  lineHeight?: number
  backgroundColor?: ColorSegments
  letterSpacing?: number
}

export type TextProps = ViewBaseProps & {
  textAlign?: string
  fragments: AttributedFragment[]
  padding?: PaddingProps
  maximumNumberOfLines?: number
  textAlignVertical?: string
  selectable?: boolean
  disabled?: boolean
  ellipsizeMode?: EllipsizeMode
}

type PaddingProps = {
  top: number,
  right: number,
  bottom: number,
  left: number
}

export enum EllipsizeMode {
  Clip,
  Head,
  Tail,
  Middle,
}

function stringToAlignment(alignment: string) {
  switch(alignment) {
    case "center":
      return TextAlign.Center
    case "right":
      return TextAlign.End
    case "justified":
      return TextAlign.JUSTIFY
    default:
      return TextAlign.Start
  }
}

export function stringToVerticalAlign(textAlignVertical: string) {
  switch (textAlignVertical) {
    case "top":
      return Alignment.TopStart
    case "bottom":
      return Alignment.BottomStart
    case "center":
      return Alignment.Start
    default:
      return undefined
  }
}

export function stringToFontStyle(style: string | undefined): FontStyle {
  if (style === 'italic') {
    return FontStyle.Italic;
  }
  return FontStyle.Normal;
}

function stringToTextTransform(textTransform: string) {
  switch (textTransform) {
    case "uppercase":
      return TextCase.UpperCase
    case "lowercase":
      return TextCase.LowerCase
    default:
      return TextCase.Normal
  }
}

export function getLetterSpacing(letterSpacing: number) {
  if (isNaN(letterSpacing)) {
    return undefined
  }
  return letterSpacing
}

/*
  * enum class TextDecorationLine {
  *   none,
  *   underline,
  *   line-through,
  *   underline line-through
  * }
  *The 'underline line-through' attribute is not implemented on ArkTS, so it is not implemented here yet.
   */
export function getTextDecorationLine(fragment: AttributedFragment | undefined) {
  switch (fragment.textDecorationLine) {
    case 1:
      return TextDecorationType.Underline;
    case 2:
      return TextDecorationType.LineThrough;
    default:
      return TextDecorationType.None;
  }
}

function capitalizeTextIfNecessary(fragment: AttributedFragment): string {
  if (fragment.textTransform != 'capitalize') {
    return fragment.text
  }
  let words = fragment.text.split(' ');
  let transformedWords = words.map(word => {
    if (word && isNaN(Number(word[0]))) {
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    }
    return word.toLowerCase();
  });

  return transformedWords.join(' ');
}

export type TextDescriptor = Descriptor<"Paragraph", TextProps>

@Component
export struct RNSimpleText {
  ctx: RNOHContext
  tag: number
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
      Text() {
        ForEach(this.descriptor.props.fragments, (fragment: AttributedFragment) => {
          Span(capitalizeTextIfNecessary(fragment))
            .fontColor(convertColorSegmentsToString(fragment.fontColor))
            .fontWeight(fragment.fontWeight)
            .fontSize(fragment.fontSize)
            .fontStyle(stringToFontStyle(fragment.fontStyle))
            .decoration({
              type: getTextDecorationLine(fragment),
              color: convertColorSegmentsToString(fragment.textDecorationColor)
            })
            .lineHeight(fragment.lineHeight ?? (fragment.fontSize ?? 16) * DEFAULT_LINE_SPACING)
            .backgroundColor(convertColorSegmentsToString(fragment.backgroundColor))// not supported
            .letterSpacing(getLetterSpacing(fragment.letterSpacing))
            .textCase(stringToTextTransform(fragment.textTransform))
        })
      }
      .width("100%")
      .height("100%")
      .maxLines(this.getMaxLines())
      .textOverflow({ overflow: this.getTextOverflow() })
      .textAlign(stringToAlignment(this.descriptor.props.textAlign))
      .align(stringToVerticalAlign(this.descriptor.props.textAlignVertical))
      .padding(this.descriptor.props.padding)
      .copyOption(this.descriptor.props.selectable ? CopyOptions.LocalDevice : CopyOptions.None)
      .enabled(!this.descriptor.props.disabled)
    }
  }
}