import { Descriptor, LayoutProps, ColorValue, Tag, ColorSegments } from './descriptor'
import { convertColorSegmentsToString, convertColorValueToRGBA } from './cpp-bridge-utils'
import { RNOHContext } from './RNOHContext'
import { RNOHEventEmitRequestHandlerName } from "./RNOHCorePackage"
import { ScrollViewState } from './RNScrollView'

export type ViewProps = LayoutProps & {
  backgroundColor?: ColorSegments
  borderWidth?: number
  borderColor?: ColorSegments
  borderRadius?: number
  opacity?: number
}

export type ViewDescriptor = Descriptor<"View", ViewProps>

function getPageOffset(ctx: RNOHContext, tag: Tag) {
  let x = 0;
  let y = 0;

  while (tag) {
    const descriptor = ctx.descriptorRegistry.getDescriptor(tag);
    if (descriptor?.type === "ScrollView") {
      const state = descriptor.state as ScrollViewState;
      x += state.contentOffsetX;
      y += state.contentOffsetY;
    }
    tag = descriptor?.parentTag;
  }

  return {x, y}
}

export function handleTouchEvent(ctx: RNOHContext, event: TouchEvent, tag: Tag) {
  event?.stopPropagation();
  const {x, y} = getPageOffset(ctx, tag);
  for (const touch of event.touches) {
    touch['pageX'] = touch.screenX + x;
    touch['pageY'] = touch.screenY + y;
  }
  for (const touch of event.changedTouches) {
    touch['pageX'] = touch.screenX + x;
    touch['pageY'] = touch.screenY + y;
  }
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
    .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
    .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
    .borderWidth(this.descriptor.props.borderWidth)
    .borderColor(convertColorSegmentsToString(this.descriptor.props.borderColor))
    .borderRadius(this.descriptor.props.borderRadius)
    .onTouch((event) => this.onTouchEvent(event))
    .opacity(this.descriptor.props.opacity)
  }
}