import matrix4 from '@ohos.matrix4'
import { BorderMetrics, ColorSegments, ColorValue } from './DescriptorBase'

// gets rid of DevEco warnings
declare function vp2px(vp: number): number;

export enum DisplayMode {
  /*
   * The surface is running normally. All visual side-effects will be rendered
   * on the screen.
   */
  Visible = 0,

  /*
   * The surface is `Suspended`. All new (committed after switching to the
   * mode) visual side-effects will *not* be mounted on the screen (the screen
   * will stop updating).
   *
   * The mode can be used for preparing a surface for possible future use.
   * The surface will be prepared without spending computing resources
   * on mounting, and then can be instantly mounted if needed.
   */
  Suspended = 1,

  /*
   * The surface is `Hidden`. All previously mounted visual side-effects
   * will be unmounted, and all new (committed after switching to the mode)
   * visual side-effects will *not* be mounted on the screen until the mode is
   * switched back to `normal`.
   *
   * The mode can be used for temporarily freeing computing resources of
   * off-the-screen surfaces.
   */
  Hidden = 2,
}

export function convertColorSegmentsToString(colorSegments?: ColorSegments) {
  if (!colorSegments) return undefined
  const [r, g, b, a] = colorSegments
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )}, ${a})`
}

export function getTintColorMatrix(colorSegments?: ColorSegments) {
  if (!colorSegments || colorSegments.every((element) => element === 0)) {
    return [
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0,
    ]
  }
  const [r, g, b, a] = colorSegments
  return [
    0, 0, 0, r, 0,
    0, 0, 0, g, 0,
    0, 0, 0, b, 0,
    0, 0, 0, 1, 0,
  ]
}

export function convertColorValueToRGBA(colorValue: ColorValue | undefined, defaultColor: string = "rgba(0,0,0,0.0)") {
  if (colorValue === undefined) return defaultColor;
  const rgba = {
    a: ((colorValue >> 24) & 0xff) / 255,
    r: (colorValue >> 16) & 0xff,
    g: (colorValue >> 8) & 0xff,
    b: ((colorValue >> 0) & 0xff),
  }
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}
export function convertColorValueToHex(colorValue: ColorValue | undefined, defaultColor: string = "#00000000") {
  if (colorValue === undefined) return defaultColor;
  const toHex = (num, padding) => num.toString(16).padStart(padding, '0');
  const argb = {
    a: (colorValue >> 24) & 0xff,
    r: (colorValue >> 16) & 0xff,
    g: (colorValue >> 8) & 0xff,
    b: ((colorValue >> 0) & 0xff),
  }
  return `#${toHex(argb.a, 2)}${toHex(argb.r, 2)}${toHex(argb.g, 2)}${toHex(argb.b, 2)}`;
}

export function convertColorValueToColorSegments(colorValue: ColorValue | undefined): ColorSegments | undefined {
  if (colorValue === undefined) return undefined
  const rgba = {
    a: ((colorValue >> 24) & 0xff) / 255,
    r: ((colorValue >> 16) & 0xff) / 255,
    g: ((colorValue >> 8) & 0xff) / 255,
    b: ((colorValue >> 0) & 0xff) / 255,
  }
  return [rgba.r, rgba.g, rgba.b, rgba.a]
}

export type TransformMatrix = [
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

export function convertMatrixArrayToMatrix4(transform: TransformMatrix) {
  if (transform.length < 16)
    return matrix4.identity();
  transform = transform.slice() as TransformMatrix;
  transform[12] = vp2px(transform[12]);
  transform[13] = vp2px(transform[13]);
  transform[14] = vp2px(transform[14]);
  return matrix4.init(transform);
}

export enum BorderEdgePropsType {
  COLOR = "Color",
  WIDTH = "Width",
}

export function resolveBorderMetrics(props: BorderMetrics, isRTL: boolean): BorderMetrics {
  const colorProps = resolveBorderEdgeProps(props, BorderEdgePropsType.COLOR, isRTL);
  const widthProps = resolveBorderEdgeProps(props, BorderEdgePropsType.WIDTH, isRTL);
  const radiusProps = resolveBorderRadius(props);
  return {...colorProps, ...widthProps, ...radiusProps, borderStyle: props.borderStyle};
}

export function resolveBorderRadius(props: BorderMetrics): BorderMetrics {
  const topLeft = props.borderTopLeftRadius;
  const topRight = props.borderTopRightRadius;
  const bottomLeft = props.borderBottomLeftRadius;
  const bottomRight = props.borderBottomRightRadius;
  const all = props.borderRadius;
  const resolvedProps = {
    borderTopLeftRadius: topLeft ?? all,
    borderTopRightRadius: topRight ?? all,
    borderBottomLeftRadius: bottomLeft ?? all,
    borderBottomRightRadius: bottomRight ?? all,
  }
  return resolvedProps;
}

export function resolveBorderEdgeProps(props: BorderMetrics, type: BorderEdgePropsType, isRTL: boolean): BorderMetrics {
  const left = props[`borderLeft${type}`]
  const top = props[`borderTop${type}`]
  const right = props[`borderRight${type}`]
  const bottom = props[`borderBottom${type}`]
  const all = props[`border${type}`]
  const start = props[`borderStart${type}`]
  const end = props[`borderEnd${type}`]

  const resolvedProps = {
    [`borderLeft${type}`]: left ?? ((isRTL ? end : start) ?? all),
    [`borderTop${type}`]: top ?? all,
    [`borderRight${type}`]: right ?? ((isRTL ? start : end) ?? all),
    [`borderBottom${type}`]: bottom ?? all,
  };

  return resolvedProps;
}

export function getTransformedVector(transformMatrix: TransformMatrix, vector: Array<number>): Array<number>{
  const resultVector = [0, 0, 0, 0]
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      resultVector[i] += transformMatrix[i*4+j] * vector[j]
    }
  }
  return resultVector
}