import rnoh from 'librnoh.so'
import { ColorSegments, Descriptor, LayoutProps, Tag } from './descriptor'
import { DescriptorRegistry } from './DescriptorRegistry'
import { ReactEventKind } from './events'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { ViewProps } from './RNView'

export type TextProps = ViewProps & {
  text?: string
  fontColor?: ColorSegments
  fontWeight?: number
  fontSize?: number
}

export type TextDescriptor = Descriptor<"Paragraph", TextProps>

@Component
export struct RNText {
  @State tag: number = -1
  @Prop descriptor: TextDescriptor

  onTouchEvent(event: TouchEvent) {
    rnoh?.emitEvent(this.descriptor.tag, ReactEventKind.TOUCH, event)
  }

  build() {
    Text(this.descriptor.props.text)
      .width(this.descriptor.props.width)
      .height(this.descriptor.props.height)
      .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
      .fontColor(convertColorSegmentsToString(this.descriptor.props.fontColor))
      .fontWeight(this.descriptor.props.fontWeight)
      .fontSize(this.descriptor.props.fontSize)
      .onTouch((event) => this.onTouchEvent(event))
  }
}