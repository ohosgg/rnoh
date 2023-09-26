import {
  Descriptor,
  RNOHContext,
  convertColorSegmentsToString,
  convertColorValueToColorSegments,
  convertMatrixArrayToMatrix4,
  OverflowMode,
  BorderMetrics,
  resolveBorderMetrics,
  LayoutDirectionRN,
} from '../../../RNOH'

import { ViewBaseProps, ViewDynamicProps } from './types'

export type ViewBaseDescriptor = Descriptor<string, ViewBaseProps>

export type ViewDynamicDescriptor = Descriptor<string, ViewDynamicProps>

function convertViewDynamicDescriptor(descriptor: ViewBaseDescriptor | ViewDynamicDescriptor): ViewBaseDescriptor {
  if (!descriptor.isDynamicBinder) {
    return descriptor as ViewBaseDescriptor
  }
  const dynamicDescriptor = descriptor as ViewDynamicDescriptor
  const p = dynamicDescriptor.props
  const isRTL = dynamicDescriptor.layoutMetrics.layoutDirection === LayoutDirectionRN.RightToLeft
  const borderMetrics = resolveBorderMetrics(p as BorderMetrics, isRTL)
  return {
    isDynamicBinder: false,
    ...dynamicDescriptor,
    props: {
      top: 0,
      left: 0,
      height: 0,
      width: 0,
      backgroundColor: convertColorValueToColorSegments(p.backgroundColor),
      borderWidth: {
        left: borderMetrics.borderLeftWidth,
        top: borderMetrics.borderTopWidth,
        right: borderMetrics.borderRightWidth,
        bottom: borderMetrics.borderBottomWidth,
      },
      borderColor: {
        left: convertColorValueToColorSegments(borderMetrics.borderLeftColor),
        top: convertColorValueToColorSegments(borderMetrics.borderTopColor),
        right: convertColorValueToColorSegments(borderMetrics.borderRightColor),
        bottom: convertColorValueToColorSegments(borderMetrics.borderBottomColor),
      },
      borderRadius: {
        topLeft: borderMetrics.borderTopLeftRadius,
        topRight: borderMetrics.borderTopRightRadius,
        bottomLeft: borderMetrics.borderBottomLeftRadius,
        bottomRight: borderMetrics.borderBottomRightRadius,
      },
      borderStyle: borderMetrics.borderStyle,
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

  getBorderStyle(): BorderStyle{
    switch (this.descriptor.props.borderStyle) {
      case "dashed":
        return BorderStyle.Dashed
      case "dotted":
        return BorderStyle.Dotted
      default:
        return BorderStyle.Solid
    }
  }

  getClip(): boolean {
    return this.descriptor.props.overflow !== OverflowMode.VISIBLE
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
    .borderStyle(this.getBorderStyle())
    .opacity(this.descriptor.props.opacity)
    .transform(this.descriptor.props.transform != undefined ? convertMatrixArrayToMatrix4(this.descriptor.props.transform) : undefined)
    .clip(this.getClip())
    .hitTestBehavior(this.getHitTestMode())
    .shadow(this.getShadow())
  }
}
