import { ColorSegments, ColorValue } from './descriptor'

export function convertColorSegmentsToString(colorSegments?: ColorSegments) {
  if (!colorSegments) return undefined
  const [r, g, b, a] = colorSegments
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )}, ${a})`
}

export function convertColorValueToRGBA(colorValue: ColorValue | undefined, defaultColor: string = "rgba(0,0,0,0.0)") {
  if (colorValue === undefined) return defaultColor;
  const rgba = {
    a: (colorValue >> 24) & 0xff / 255,
    r: (colorValue >> 16) & 0xff,
    g: (colorValue >> 8) & 0xff,
    b: ((colorValue >> 0) & 0xff),
  }
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}
