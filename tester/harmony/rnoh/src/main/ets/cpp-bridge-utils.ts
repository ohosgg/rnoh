import { ColorSegments } from './descriptor'

export function convertColorSegmentsToString(colorSegments?: ColorSegments) {
  if (!colorSegments) return undefined
  const [r, g, b, a] = colorSegments
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )}, ${a})`
}

export function convertColorValueToRGBA(colorValue: number) {
  const rgba = {
    r: (colorValue >> 24) & 0xff,
    g: (colorValue >> 16) & 0xff,
    b: (colorValue >> 8) & 0xff,
    a: ((colorValue >> 0) & 0xff) / 255,
  }
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}
