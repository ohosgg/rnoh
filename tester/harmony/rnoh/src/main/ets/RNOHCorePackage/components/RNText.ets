import { ColorSegments, Descriptor, convertColorSegmentsToString, RNOHContext } from '../../RNOH'
import { ViewBaseProps, RNViewBase } from './RNViewBase'

export type AttributedFragment = {
  text?: string
  fontColor?: ColorSegments
  fontWeight?: number
  fontSize?: number
  fontStyle?: string
}

export type TextProps = ViewBaseProps & {
  textAlign?: string
  fragments: AttributedFragment[]
}

function stringToAlignment(alignment: string) {
  if (alignment === 'center')
    return TextAlign.Center
  else if (alignment === 'right')
    return TextAlign.End
  else
    return TextAlign.Start
}

function stringToFontStyle(style: string | undefined): FontStyle {
  if (style === 'italic') {
    return FontStyle.Italic;
  }
  return FontStyle.Normal;
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

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      Text() {
        ForEach(this.descriptor.props.fragments, fragment => {
          Span(fragment.text)
            .fontColor(convertColorSegmentsToString(fragment.fontColor))
            .fontWeight(fragment.fontWeight)
            .fontSize(fragment.fontSize)
            .fontStyle(stringToFontStyle(fragment.fontStyle))
        })
      }
      .width("100%")
      .height("100%")
      .textAlign(stringToAlignment(this.descriptor.props.textAlign))
    }
  }
}