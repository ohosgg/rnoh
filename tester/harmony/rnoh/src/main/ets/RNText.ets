import { ColorSegments, Descriptor, LayoutProps, Tag } from './descriptor'
import { DescriptorRegistry } from './DescriptorRegistry'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { ViewProps, handleTouchEvent } from './RNView'
import { RNInstance } from './RNInstance'
import { RNOHContext } from './RNOHContext'

export type TextProps = ViewProps & {
  text?: string
  textAlign?: string
  fontColor?: ColorSegments
  fontWeight?: number
  fontSize?: number
}

function convertAlignmentStringToEnum(alignment: string) {
  if(alignment==='center')
    return TextAlign.Center
  else if(alignment==='right')
    return TextAlign.End
  else
    return TextAlign.Start
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
    Text(this.descriptor.props.text)
      .width(this.descriptor.props.width)
      .height(this.descriptor.props.height)
      .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
      .textAlign(convertAlignmentStringToEnum(this.descriptor.props.textAlign))
      .fontColor(convertColorSegmentsToString(this.descriptor.props.fontColor))
      .fontWeight(this.descriptor.props.fontWeight)
      .fontSize(this.descriptor.props.fontSize)
      .onTouch((event) => this.onTouchEvent(event))
  }
}