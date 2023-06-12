import { Descriptor, LayoutProps, ColorValue, Tag } from './descriptor'
import { convertColorValueToRGBA } from './cpp-bridge-utils'
import { RNOHContext } from './RNOHContext'
import { RNOHEventEmitRequestHandlerName } from "./RNOHCorePackage"

export type ViewProps = LayoutProps & {
  backgroundColor?: ColorValue
  borderWidth?: number
  borderColor?: ColorValue
  borderRadius?: number
  opacity?: number
}

export type ViewDescriptor = Descriptor<"View", ViewProps>

export function handleTouchEvent(ctx: RNOHContext, event: TouchEvent, tag: Tag) {
  ctx.rnInstance.emitComponentEvent(tag, RNOHEventEmitRequestHandlerName.Touch, event)
}

@Component
export struct RNView {
  ctx: RNOHContext
  @State tag: number = -1
  @BuilderParam renderDescriptors: () => void
  @Prop descriptor: ViewDescriptor

  onTouchEvent(event: TouchEvent) {
    handleTouchEvent(this.ctx, event, this.descriptor.tag)
  }

  build() {
    Stack() {
      this.renderDescriptors()
    }
    .width(this.descriptor.props.width)
    .height(this.descriptor.props.height)
    .backgroundColor(convertColorValueToRGBA(this.descriptor.props.backgroundColor))
    .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
    .borderWidth(this.descriptor.props.borderWidth)
    .borderColor(convertColorValueToRGBA(this.descriptor.props.borderColor))
    .borderRadius(this.descriptor.props.borderRadius)
    .onTouch((event) => this.onTouchEvent(event))
    .opacity(this.descriptor.props.opacity)
  }
}