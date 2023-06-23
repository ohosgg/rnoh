import {
  Descriptor,
  LayoutProps,
  Tag,
  ColorSegments,
  RNOHContext,
  convertColorSegmentsToString,
  convertColorValueToColorSegments
} from '../../RNOH'
import { RNOHEventEmitRequestHandlerName } from "./../RNOHEventEmitRequestHandler"
import type { ScrollViewState } from './RNScrollView'

export type ViewProps = LayoutProps & {
  backgroundColor?: ColorSegments
  borderWidth?: number
  borderColor?: ColorSegments
  borderRadius?: BorderRadii
  opacity?: number
}

export type ViewDynamicProps = {
  backgroundColor?: number,
  width?: number,
  height?: number,
  justifyContent?: string,
  opacity?: number,
  alignItems?: string,
  borderWidth?: number,
  borderRadius?: number,
  borderColor?: number,
}

type BorderRadii = {
  topLeft?: number
  topRight?: number
  bottomLeft?: number
  bottomRight?: number
}

export type ViewDescriptor = Descriptor<"View" | (string & {}), ViewProps>

export type ViewDynamicDescriptor = Descriptor<"View" | (string & {}), ViewDynamicProps>

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

  return { x, y }
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

function convertViewDynamicDescriptor(dynamicDescriptor: ViewDynamicDescriptor): ViewDescriptor {
  const p = dynamicDescriptor.props
  return {
    isDynamicBinder: false,
    ...dynamicDescriptor,
    props: {
      top: 0,
      left: 0,
      height: 0,
      width: 0,
      backgroundColor: convertColorValueToColorSegments(p.backgroundColor),
      borderWidth: p.borderWidth,
      borderColor: convertColorValueToColorSegments(p.borderColor),
      borderRadius: { topLeft: p.borderRadius, topRight: p.borderRadius, bottomLeft: p.borderRadius, bottomRight: p.borderRadius},
      opacity: p.opacity
    }
  }
}

@Component
export struct RNView {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderDescriptors: () => void
  @State descriptor: ViewDescriptor = {} as ViewDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    let descriptor = this.ctx.descriptorRegistry.getDescriptor<ViewDescriptor | ViewDynamicDescriptor>(this.tag)
    this.setDescriptor(descriptor)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.setDescriptor(newDescriptor)
      }
    )
  }

  private setDescriptor(descriptor: ViewDescriptor | ViewDynamicDescriptor) {
    if (descriptor.isDynamicBinder) {
      descriptor = convertViewDynamicDescriptor(descriptor as ViewDynamicDescriptor)
    }
    this.descriptor = descriptor as ViewDescriptor
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  onTouchEvent(event: TouchEvent) {
    handleTouchEvent(this.ctx, event, this.descriptor.tag)
  }

  build() {
    Stack() {
      this.renderDescriptors()
    }
    .width(this.descriptor.layoutMetrics.frame.size.width)
    .height(this.descriptor.layoutMetrics.frame.size.height)
    .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
    .position({ y: this.descriptor.layoutMetrics.frame.origin.y, x: this.descriptor.layoutMetrics.frame.origin.x })
    .borderWidth(this.descriptor.props.borderWidth)
    .borderColor(convertColorSegmentsToString(this.descriptor.props.borderColor))
    .borderRadius(this.descriptor.props.borderRadius)
    .onTouch((event) => this.onTouchEvent(event))
    .opacity(this.descriptor.props.opacity)
    .clip(true)
  }
}

@Component
export struct RNViewBase {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderChildren: () => void

  build() {
    RNView({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      this.renderChildren()
    }
  }
}