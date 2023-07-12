import matrix4 from '@ohos.matrix4'
import display from '@ohos.display'
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

export type ViewBaseProps = LayoutProps & {
  backgroundColor?: ColorSegments
  borderWidth?: number
  borderColor?: ColorSegments
  borderRadius?: BorderRadii
  opacity?: number
  transform?: TransformMatrix,
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

type TransformMatrix = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export type ViewBaseDescriptor = Descriptor<string, ViewBaseProps>

export type ViewDynamicDescriptor = Descriptor<string, ViewDynamicProps>

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
  ctx.rnInstanceManager.emitComponentEvent(tag, RNOHEventEmitRequestHandlerName.Touch, event)
}

function convertViewDynamicDescriptor(dynamicDescriptor: ViewDynamicDescriptor): ViewBaseDescriptor {
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
      borderRadius: {
        topLeft: p.borderRadius,
        topRight: p.borderRadius,
        bottomLeft: p.borderRadius,
        bottomRight: p.borderRadius
      },
      opacity: p.opacity
    }
  }
}

function convertTranslationPixelsToPhysicalPixels(transform: TransformMatrix) {
  let displayInstance = display.getDefaultDisplaySync();
  transform[12] = transform[12] * displayInstance.densityPixels;
  transform[13] = transform[13] * displayInstance.densityPixels;
  return transform;
}

@Component
export struct RNViewBase {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderChildren: () => void
  @State private descriptor: ViewBaseDescriptor = {} as ViewBaseDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    let descriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor | ViewDynamicDescriptor>(this.tag)
    this.setDescriptor(descriptor)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.setDescriptor(newDescriptor)
      }
    )
  }

  private setDescriptor(descriptor: ViewBaseDescriptor | ViewDynamicDescriptor) {
    if (descriptor.isDynamicBinder) {
      descriptor = convertViewDynamicDescriptor(descriptor as ViewDynamicDescriptor)
    }
    this.descriptor = descriptor as ViewBaseDescriptor
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  onTouchEvent(event: TouchEvent) {
    handleTouchEvent(this.ctx, event, this.descriptor.tag)
  }

  build() {
    Stack() {
      this.renderChildren()
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
    .transform(this.descriptor.props.transform != undefined ? matrix4.init(convertTranslationPixelsToPhysicalPixels(this.descriptor.props.transform)) : undefined)
    .clip(true)
  }
}
