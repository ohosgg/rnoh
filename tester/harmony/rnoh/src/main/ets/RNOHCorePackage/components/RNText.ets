import { ColorSegments, Descriptor, convertColorSegmentsToString, RNOHContext } from '../../RNOH'
import { ViewBaseProps, RNViewBase } from './RNViewBase'

export type AttributedFragment = {
  text?: string
  fontColor?: ColorSegments
  fontWeight?: number
  fontSize?: number
  fontStyle?: string
  textDecorationLine?: number
  textDecorationColor?: ColorSegments
  lineHeight?: number
  backgroundColor?: ColorSegments
}

export type TextProps = ViewBaseProps & {
  textAlign?: string
  fragments: AttributedFragment[]
  padding?: PaddingProps
  maximumNumberOfLines?: number
  textAlignVertical?: string
}

type PaddingProps = {
  top: number,
  right: number,
  bottom: number,
  left: number
}

function stringToAlignment(alignment: string) {
  if (alignment === 'center')
    return TextAlign.Center
  else if (alignment === 'right')
    return TextAlign.End
  else
    return TextAlign.Start
}

function stringToVerticalAlign(textAlignVertical: string) {
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

function stringToFontStyle(style: string | undefined): FontStyle {
  if (style === 'italic') {
    return FontStyle.Italic;
  }
  return FontStyle.Normal;
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
function getTextDecorationLine(fragment: AttributedFragment | undefined) {
  switch(fragment.textDecorationLine) {
    case 1:
      return TextDecorationType.Underline;
    case 2:
      return TextDecorationType.LineThrough;
    default :
      return TextDecorationType.None;
  }
}

export type TextDescriptor = Descriptor<"Paragraph", TextProps>

@Component
export struct RNText {
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

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      Text() {
        ForEach(this.descriptor.props.fragments, (fragment: AttributedFragment) => {
          Span(fragment.text)
            .fontColor(convertColorSegmentsToString(fragment.fontColor))
            .fontWeight(fragment.fontWeight)
            .fontSize(fragment.fontSize)
            .fontStyle(stringToFontStyle(fragment.fontStyle))
            .decoration({type: getTextDecorationLine(fragment), color: convertColorSegmentsToString(fragment.textDecorationColor)})
            .lineHeight(fragment.lineHeight)
            .backgroundColor(convertColorSegmentsToString(fragment.backgroundColor)) // not supported
        })
      }
      .width("100%")
      .height("100%")
      .maxLines(this.getMaxLines())
      .textOverflow({overflow: TextOverflow.Ellipsis})
      .textAlign(stringToAlignment(this.descriptor.props.textAlign))
      .align(stringToVerticalAlign(this.descriptor.props.textAlignVertical))
      .padding(this.descriptor.props.padding)
    }
  }
}