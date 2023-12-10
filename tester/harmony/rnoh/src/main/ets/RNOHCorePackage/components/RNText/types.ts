import type { ColorSegments, Descriptor, Tag } from '../../../RNOH/DescriptorBase'
import type { OHOSMeasurerTextFragmentExtraData } from '../../../RNOH/TextLayoutManager'
import type { ViewBaseProps } from '../RNViewBase/types'
import { AccessibilityProps as ViewAccessibility } from '../RNViewBase/ViewAccessibilityTypes';

export type AttributedFragment = {
  text?: string
  fontColor?: ColorSegments
  fontFamily?: string
  fontWeight?: number
  fontSize?: number
  fontStyle?: string
  textDecorationLine?: number
  textDecorationColor?: ColorSegments
  textTransform?: string
  lineHeight?: number
  backgroundColor?: ColorSegments
  letterSpacing?: number
  textShadowProps?: TextShadowProps
  parentShadowView?: {
    tag: Tag,
    layoutMetrics: {
      frame: {
        size: {
          width: number,
          height: number
        }
      }
    }
  }
}

export type TextFragmentExtraData = OHOSMeasurerTextFragmentExtraData & {
  fontColor?: string
  backgroundColor?: string
  fontStyle?: string
  textDecorationColor?: ColorSegments,
  textDecorationLine?: number,
  textTransform?: string,
  textShadowProps?: TextShadowProps
  tag?: Tag,
}

export type TextDescriptor = Descriptor<"Paragraph", TextProps>

export type TextShadowProps = {
  textShadowColor?: ColorSegments,
  textShadowOffset?: {
    width: number,
    height: number
  },
  textShadowRadius?: number,
}

export type TextProps = ViewBaseProps & ViewAccessibility & {
  textAlign?: string
  fragments: AttributedFragment[]
  padding?: PaddingProps
  maximumNumberOfLines?: number
  textAlignVertical?: string
  selectable?: boolean
  disabled?: boolean
  ellipsizeMode?: EllipsizeMode
}

type PaddingProps = {
  top: number,
  right: number,
  bottom: number,
  left: number
}

export enum EllipsizeMode {
  Clip,
  Head,
  Tail,
  Middle,
}