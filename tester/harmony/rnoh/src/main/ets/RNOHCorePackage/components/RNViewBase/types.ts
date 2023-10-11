import {
  LayoutProps,
  ColorSegments,
  TransformMatrix,
  OverflowMode,
  BorderMetrics,
} from '../../../RNOH'
import type { PointerEvents } from '../../componentManagers/RNViewManager'

export type BackfaceVisibility = "visible" | "hidden"

export type ViewBaseProps = LayoutProps & {
  backgroundColor?: ColorSegments
  borderWidth?: BorderWidths
  borderColor?: BorderColors
  borderRadius?: BorderRadii
  borderStyle?: string
  opacity?: number
  transform?: TransformMatrix,
  pointerEvents?: PointerEvents
  shadowColor?: ColorSegments,
  shadowOffset?: {
    width: number,
    height: number
  },
  shadowOpacity?: number,
  shadowRadius?: number,
  overflow?: OverflowMode,
  backfaceVisibility?: BackfaceVisibility,
}

export type ViewDynamicProps = BorderMetrics & {
  backgroundColor?: number,
  width?: number,
  height?: number,
  justifyContent?: string,
  opacity?: number,
  alignItems?: string,
}

export type BorderRadii = {
  topLeft?: number
  topRight?: number
  bottomLeft?: number
  bottomRight?: number
}

export type BorderColors = {
  left?: ColorSegments
  top?: ColorSegments
  right?: ColorSegments
  bottom?: ColorSegments
}

export type BorderWidths = {
  left?: number
  top?: number
  right?: number
  bottom?: number
}