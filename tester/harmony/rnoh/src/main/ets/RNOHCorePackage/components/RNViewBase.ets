import {
  Descriptor,
  LayoutProps,
  ColorSegments,
  RNOHContext,
  convertColorSegmentsToString,
  convertColorValueToColorSegments,
  convertMatrixArrayToMatrix4,
  TransformMatrix
} from '../../RNOH'

export type PointerEvents = "auto" | "none" | "box-none" | "box-only"

export type ViewBaseProps = LayoutProps & {
  backgroundColor?: ColorSegments
  borderWidth?: number
  borderColor?: BorderColors
  borderRadius?: BorderRadii
  opacity?: number
  transform?: TransformMatrix,
  pointerEvents?: PointerEvents
  shadowColor?: ColorSegments,
  shadowOffset?: {
    width: number,
    height: number
  },
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

type BorderColors = {
  left?: ColorSegments
  top?: ColorSegments
  right?: ColorSegments
  bottom?: ColorSegments
}

export type ViewBaseDescriptor = Descriptor<string, ViewBaseProps>

export type ViewDynamicDescriptor = Descriptor<string, ViewDynamicProps>

function convertViewDynamicDescriptor(descriptor: ViewBaseDescriptor | ViewDynamicDescriptor): ViewBaseDescriptor {
  if (!descriptor.isDynamicBinder) {
    return descriptor as ViewBaseDescriptor
  }
  const dynamicDescriptor = descriptor as ViewDynamicDescriptor
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
      borderColor: {
        left: convertColorValueToColorSegments(p.borderColor),
        top: convertColorValueToColorSegments(p.borderColor),
        right: convertColorValueToColorSegments(p.borderColor),
        bottom: convertColorValueToColorSegments(p.borderColor),
      },
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
    this.descriptor = convertViewDynamicDescriptor(descriptor)
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
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
    const colorSegments = props.shadowColor ?? [0, 0, 0, 1]
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
    .borderColor({
      left: convertColorSegmentsToString(this.descriptor.props.borderColor.left),
      top: convertColorSegmentsToString(this.descriptor.props.borderColor.top),
      right: convertColorSegmentsToString(this.descriptor.props.borderColor.right),
      bottom: convertColorSegmentsToString(this.descriptor.props.borderColor.bottom),
    }
    )
    .borderRadius(this.descriptor.props.borderRadius)
    .opacity(this.descriptor.props.opacity)
    .transform(this.descriptor.props.transform != undefined ? convertMatrixArrayToMatrix4(this.descriptor.props.transform) : undefined)
    .clip(true)
    .hitTestBehavior(this.getHitTestMode())
    .shadow(this.getShadow())
  }
}
