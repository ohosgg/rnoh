import matrix4 from '@ohos.matrix4'
import {
  Descriptor,
  LayoutProps,
  ColorSegments,
  RNOHContext,
  convertColorSegmentsToString,
  convertColorValueToColorSegments
} from '../../RNOH'
import { RNOHEventEmitRequestHandlerName } from "./../RNOHEventEmitRequestHandler"

export type ViewBaseProps = LayoutProps & {
  backgroundColor?: ColorSegments
  borderWidth?: number
  borderColor?: ColorSegments
  borderRadius?: BorderRadii
  opacity?: number
  transform?: TransformMatrix,
  pointerEvents?: "auto" | "none" | "box-none" | "box-only"
  shadowColor?: ColorSegments,
  shadowOffset?: {width: number, height: number},
  shadowOpacity?: number,
  shadowRadius?: number
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
      opacity: p.opacity,
    }
  }
}

function convertMatrixArrayToMatrix4(transform: TransformMatrix) {
  if (transform.length < 16)
    return matrix4.identity();
  transform[12] = vp2px(transform[12]);
  transform[13] = vp2px(transform[13]);
  transform[14] = vp2px(transform[14]);
  return matrix4.init(transform);
}

@Component
export struct RNViewBase {
  private static lastTouchEventTimestamp = 0
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
    if (this.descriptor.props.pointerEvents === "box-none") {
      return;
    }

    // report a single event only to the innermost React component,
    // since React handles event propagation on its own.
    // We cannot use `event.stopPropagation` since it breaks other native components
    // (e.g `Scroll` not stopping when touched)
    // We identify TouchEvents by their timestamp, they should be unique enough.
    if (RNViewBase.lastTouchEventTimestamp === event.timestamp) {
      return;
    }
    RNViewBase.lastTouchEventTimestamp = event.timestamp

    const surfaceOffset = this.ctx.rnInstanceManager.getSurfaceOffset()

    for (const touch of event.touches) {
      touch['pageX'] = touch.screenX - surfaceOffset.x;
      touch['pageY'] = touch.screenY - surfaceOffset.y;
    }
    for (const touch of event.changedTouches) {
      touch['pageX'] = touch.screenX - surfaceOffset.x;
      touch['pageY'] = touch.screenY - surfaceOffset.y;
    }

    this.ctx.rnInstanceManager.emitComponentEvent(this.tag, RNOHEventEmitRequestHandlerName.Touch, event)
  }

  getHitTestMode() {
    switch (this.descriptor.props.pointerEvents) {
      case "none":
        return HitTestMode.None
      case "box-none":
        return HitTestMode.None
      case "box-only":
        return HitTestMode.Block
      default:
        return HitTestMode.Default
    }
  }

  getShadow(): {
    radius: number;
    color?: string;
    offsetX?: number;
    offsetY?: number;
  } | undefined {
    const shadowRadius = this.descriptor.props.shadowRadius
    if (shadowRadius === undefined || shadowRadius === 0)
      return undefined

    const props = this.descriptor.props
    const colorSegments = props.shadowColor ?? [0,0,0,1]
    colorSegments[3] *= (props.shadowOpacity ?? 1)
    return {
      radius: shadowRadius,
      color: convertColorSegmentsToString(colorSegments),
      offsetX: props.shadowOffset?.width,
      offsetY: props.shadowOffset?.height,
    }
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
    .transform(this.descriptor.props.transform != undefined ? convertMatrixArrayToMatrix4(this.descriptor.props.transform) : undefined)
    .clip(true)
    .hitTestBehavior(this.getHitTestMode())
    .shadow(this.getShadow())
  }
}
