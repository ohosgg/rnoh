import {
  convertColorValueToHex,
  convertColorValueToColorSegments,
  convertColorSegmentsToString,
  ReadonlyTransformationMatrix,
  TransformMatrix,
  Descriptor,
  BorderStyle,
  PointerEvents,
  getTransformedVector,
  DescriptorWrapper,
  Edges,
  Corners,
  CompactValue
} from "../../../RNOH"
import { ViewBaseProps, ViewRawProps } from "./types"
import matrix4 from '@ohos.matrix4'
import { ShadowStyleIOS } from '../../../RNOH/RNTypes'


function mapEdge<T, R>(edges: Edges<T>, cb: (value: T, key: keyof Edges<T>) => R): Edges<R> {
  return {
    top: cb(edges.top, "top"),
    left: cb(edges.left, "left"),
    right: cb(edges.right, "right"),
    bottom: cb(edges.bottom, "bottom"),
  }
}

export class ViewDescriptorWrapperBase<TType extends string = string, TProps extends ViewBaseProps = ViewBaseProps, TState extends Object = {}, TRawProps extends ViewRawProps = ViewRawProps> extends DescriptorWrapper<TType, TProps, TState, TRawProps> {
  public constructor(viewDescriptor: Descriptor) {
    // casting because ArkTS cannot infer types
    super(viewDescriptor as Descriptor<TType, TProps, TState, TRawProps>)
  }

  public get backgroundColor(): string | undefined {
    return convertColorValueToHex(this.rawProps.backgroundColor)
  }

  public get borderWidth(): Edges<number | undefined> {
    return this.resolveEdges({
      all: this.rawProps.borderWidth,
      top: this.rawProps.borderTopWidth,
      left: this.rawProps.borderLeftWidth,
      right: this.rawProps.borderRightWidth,
      bottom: this.rawProps.borderBottomWidth,
      start: this.rawProps.borderStartWidth,
      end: this.rawProps.borderEndWidth,
    })
  }

  public get padding(): Edges<CompactValue> {
    const resolvedEdges = this.resolveEdges({
      all: this.rawProps.padding,
      top: this.rawProps.paddingTop,
      left: this.rawProps.paddingLeft,
      right: this.rawProps.paddingRight,
      bottom: this.rawProps.paddingBottom,
      start: this.rawProps.paddingStart,
      end: this.rawProps.paddingEnd,
    })
    return {
      top: new CompactValue(resolvedEdges.top, this.height),
      left: new CompactValue(resolvedEdges.left, this.width),
      right: new CompactValue(resolvedEdges.right, this.width),
      bottom: new CompactValue(resolvedEdges.bottom, this.height),
    }
  }

  protected resolveEdges<T>(edges: {
    all: T | undefined,
    top: T | undefined,
    left: T | undefined,
    right: T | undefined,
    bottom: T | undefined
    start: T | undefined
    end: T | undefined
  }): Edges<T | undefined> {
    return {
      top: edges.top ?? edges.all,
      left: edges.left ?? (this.isRTL ? edges.end : edges.start) ?? edges.all,
      right: edges.right ?? (this.isRTL ? edges.start : edges.end) ?? edges.all,
      bottom: edges.bottom ?? edges.all
    };
  }

  public get borderColor(): Edges<string | undefined> {
    return mapEdge(this.resolveEdges({
      all: this.rawProps.borderColor,
      top: this.rawProps.borderTopColor,
      left: this.rawProps.borderLeftColor,
      right: this.rawProps.borderRightColor,
      bottom: this.rawProps.borderBottomColor,
      start: this.rawProps.borderStartColor,
      end: this.rawProps.borderEndColor
    }), (value) => convertColorValueToHex(value))
  }


  public get borderRadius(): Corners<number | undefined> {
    return this.resolveCorners({
      all: this.rawProps.borderRadius,
      topLeft: this.rawProps.borderTopLeftRadius,
      topRight: this.rawProps.borderTopRightRadius,
      topStart: this.rawProps.borderTopStartRadius,
      topEnd: this.rawProps.borderTopEndRadius,
      bottomLeft: this.rawProps.borderBottomLeftRadius,
      bottomRight: this.rawProps.borderBottomRightRadius,
      bottomStart: this.rawProps.borderBottomStartRadius,
      bottomEnd: this.rawProps.borderBottomEndRadius
    })
  }

  protected resolveCorners<T>(corners: {
    all: T | undefined,
    topLeft: T | undefined,
    topRight: T | undefined,
    topStart: T | undefined,
    topEnd: T | undefined,
    bottomLeft: T | undefined,
    bottomRight: T | undefined,
    bottomStart: T | undefined,
    bottomEnd: T | undefined,
  }): Corners<T | undefined> {
    return {
      topLeft: corners.topLeft ?? (this.isRTL ? corners.topEnd : corners.topStart) ?? corners.all,
      topRight: corners.topRight ?? (this.isRTL ? corners.topStart : corners.topEnd) ?? corners.all,
      bottomLeft: corners.bottomLeft ?? (this.isRTL ? corners.bottomEnd : corners.bottomStart) ?? corners.all,
      bottomRight: corners.bottomRight ?? (this.isRTL ? corners.bottomStart : corners.bottomEnd) ?? corners.all,
    }
  }

  public get borderStyle(): BorderStyle {
    return this.rawProps.borderStyle ?? "solid"
  }

  public get rawTransformationMatrix(): ReadonlyTransformationMatrix {
    if (!('transform' in this.props)) {
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    }
    if (this.props.transform.length != 16) {
      throw new Error("Transformation matrix must have a size of 16")
    }
    return this.props.transform.slice() as TransformMatrix
  }

  public get transformationMatrix(): matrix4.Matrix4Transit {
    return matrix4.init(this.rawTransformationMatrix as TransformMatrix);
  }

  public get pointerEvents(): PointerEvents {
    return this.rawProps.pointerEvents ?? "auto"
  }

  public get shadow() {
    const shadowRadius = this.shadowRadius
    if (shadowRadius === undefined || shadowRadius === 0) {
      return undefined
    }
    return {
      radius: shadowRadius,
      color: this.shadowColor,
      offsetX: this.shadowOffset?.width,
      offsetY: this.shadowOffset?.height,
    }
  }

  protected get shadowColor() {
    const colorSegments = convertColorValueToColorSegments(this.rawProps.shadowColor) ?? [0, 0, 0, 1]
    colorSegments[3] *= this.shadowOpacity
    return convertColorSegmentsToString(colorSegments)
  }

  protected get shadowOffset(): ShadowStyleIOS["shadowOffset"] | undefined {
    return this.rawProps.shadowOffset
  }

  protected get shadowOpacity(): number {
    return this.rawProps.shadowOpacity ?? 1
  }

  protected get shadowRadius(): number | undefined {
    return this.rawProps.shadowRadius
  }

  public get isClipping(): boolean {
    return (this.rawProps.overflow === "hidden" || this.rawProps.overflow === "scroll") ?? false
  }

  public get opacity() {
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
    const matrix = this.rawTransformationMatrix
    if (this.backfaceVisibility !== "hidden" || !matrix) {
      return this.rawProps.opacity;
    }
    const unitVector = [0, 0, 1, 0]
    const resultVector = getTransformedVector(matrix, unitVector)
    if (resultVector[2] < 0) {
      return 0;
    }
    return this.rawProps.opacity;
  }

  protected get backfaceVisibility() {
    return this.rawProps.backfaceVisibility ?? "visible"
  }

  public get hitSlop(): Edges<number> {
    return {
      top: this.rawProps.hitSlop?.top ?? 0,
      left: this.rawProps.hitSlop?.left ?? 0,
      right: this.rawProps.hitSlop?.right ?? 0,
      bottom: this.rawProps.hitSlop?.bottom ?? 0,
    }
  }

  public get focusable(): boolean {
    return this.rawProps.focusable ?? false
  }
}

export class ViewDescriptorWrapper extends ViewDescriptorWrapperBase<string, ViewBaseProps, {}, ViewRawProps> {
  constructor(descriptor: Descriptor<string, ViewBaseProps, {}, ViewRawProps>) {
    super(descriptor)
  }
}
