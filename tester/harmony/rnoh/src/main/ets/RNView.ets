import { ColorSegments, Descriptor, LayoutProps, Tag } from './descriptor'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { ReactEventKind } from './events'
import { RNInstance } from "./RNInstance"
import RNOHLogger from './RNOHLogger'
import { RNOHContext } from './RNOHContext'

export type ViewProps = LayoutProps & {
  backgroundColor?: ColorSegments
  borderWidth?: number
  borderColor?: ColorSegments
  borderRadius?: number
  opacity?: number
}

export type ViewDescriptor = Descriptor<"View", ViewProps>

@Component
export struct RNView {
  ctx: RNOHContext
  @State tag: number = -1
  @BuilderParam renderDescriptors: () => void
  @Prop descriptor: ViewDescriptor

  onTouchEvent(event: TouchEvent) {
    this.ctx.rnInstance.emitEvent(this.descriptor.tag, ReactEventKind.TOUCH, event)
  }

  build() {
    Stack() {
      this.renderDescriptors()
    }
    .width(this.descriptor.props.width)
    .height(this.descriptor.props.height)
    .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
    .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
    .borderWidth(this.descriptor.props.borderWidth)
    .borderColor(convertColorSegmentsToString(this.descriptor.props.borderColor))
    .borderRadius(this.descriptor.props.borderRadius)
    .onTouch((event) => this.onTouchEvent(event))
    .opacity(this.descriptor.props.opacity)
  }
}