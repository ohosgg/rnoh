import { ColorSegments } from './descriptor'

export function convertColorSegmentsToString(colorSegments?: ColorSegments) {
  if (!colorSegments) return undefined
  const [r, g, b, a] = colorSegments
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )}, ${a})`
}
