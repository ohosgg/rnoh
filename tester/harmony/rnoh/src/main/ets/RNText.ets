import { ColorSegments, Descriptor, LayoutProps, Tag } from './descriptor'
import { DescriptorRegistry } from './DescriptorRegistry'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { ViewProps, handleTouchEvent } from './RNView'
import { RNInstance } from './RNInstance'
import { RNOHContext } from './RNOHContext'

export type AttributedFragment = {
  text?: string
  fontColor?: ColorSegments
  fontWeight?: number
  fontSize?: number
  fontStyle?: string
}

export type TextProps = ViewProps & {
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
  @State tag: number = -1
  @Prop descriptor: TextDescriptor

  onTouchEvent(e: TouchEvent) {
    handleTouchEvent(this.ctx, e, this.descriptor.tag)
  }

  build() {
    Text() {
      ForEach(this.descriptor.props.fragments, fragment => {
        Span(fragment.text)
          .fontColor(convertColorSegmentsToString(fragment.fontColor))
          .fontWeight(fragment.fontWeight)
          .fontSize(fragment.fontSize)
          .fontStyle(stringToFontStyle(fragment.fontStyle))
      })
    }
    .width(this.descriptor.props.width)
    .height(this.descriptor.props.height)
    .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
    .textAlign(stringToAlignment(this.descriptor.props.textAlign))
    .onTouch((event) => this.onTouchEvent(event))
  }
}