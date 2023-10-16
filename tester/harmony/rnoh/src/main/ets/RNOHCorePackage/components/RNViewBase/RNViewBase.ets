import type {
  Descriptor,
  BorderMetrics} from '../../../RNOH';
import {
  RNOHContext,
  convertColorSegmentsToString,
  convertColorValueToColorSegments,
  convertMatrixArrayToMatrix4,
  OverflowMode,
  resolveBorderMetrics,
  LayoutDirectionRN,
  getTransformedVector,
} from '../../../RNOH'
import type { ViewBaseProps, ViewDynamicProps } from './types'
import { RNViewManager } from '../../componentManagers'

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
    childrenTags: dynamicDescriptor.childrenTags,
    tag: dynamicDescriptor.tag,
    type: dynamicDescriptor.type,
    parentTag: dynamicDescriptor.parentTag,
    state: dynamicDescriptor.state,
    rawProps: dynamicDescriptor.rawProps,
    layoutMetrics: dynamicDescriptor.layoutMetrics,
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
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam renderChildren: () => void
  public componentManager: RNViewManager = undefined;
  @State private descriptor: ViewBaseDescriptor = {} as ViewBaseDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined
  private unregisterComponentManager?: () => void = undefined

  aboutToAppear() {
    let descriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor | ViewDynamicDescriptor>(this.tag)
    if (!this.componentManager) {
      this.componentManager = new RNViewManager(this.tag, this.ctx)
    }
    this.unregisterComponentManager = this.ctx.componentManagerRegistry.registerComponentManager(this.tag, this.componentManager)
    this.setDescriptor(descriptor)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.setDescriptor(newDescriptor)
      }
    )
  }

  private setDescriptor(descriptor: ViewBaseDescriptor | ViewDynamicDescriptor) {
    this.descriptor = convertViewDynamicDescriptor(descriptor)
    this.componentManager.updateBoundingBox();
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
    this.unregisterComponentManager?.()
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

  getShadow(): ShadowOptions | undefined {
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
  
  getOpacity(): number {
    /**
     * When backfaceVisibility is set to 'hidden' we need to determine whether the
     * front face or the back face of the view is shown - and make it invisible in
     * the latter case by setting opacity to 0. We determine it by transforming
     * an unit vector with z coordinate equal to 1 (using the transform matrix
     * provided in props) and checking whether such transformation makes it point
     * in the opposite direction. Since it is not possible to set scale on the
     * z coordinate in RN then the sign of the z coordinate is determined directly
     * by the component's rotation and as such provides the necessary information.
     * */
    const backfaceVisibility = this.descriptor.props.backfaceVisibility;
    const matrix = this.descriptor.props.transform

    if (backfaceVisibility !== "hidden" || !matrix) {
      return this.descriptor.props.opacity;
    }
    const unitVector = [0, 0, 1, 0]
    const resultVector = getTransformedVector(matrix, unitVector)
    if (resultVector[2] < 0) {
      return 0;
    }

    return this.descriptor.props.opacity;
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
    .opacity(this.getOpacity())
    .transform(this.descriptor.props.transform != undefined ? convertMatrixArrayToMatrix4(this.descriptor.props.transform) : undefined)
    .clip(this.getClip())
    .hitTestBehavior(this.getHitTestMode())
    .shadow(this.getShadow())
  }
}
