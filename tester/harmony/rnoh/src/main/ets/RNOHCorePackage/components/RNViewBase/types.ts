import type { ColorSegments, TransformMatrix, RawPropsBase, PropsBase } from '../../../RNOH/ts';
import { ViewStyle } from '../../../RNOH/RNTypes';
import { AccessibilityProps as ViewAccessibility } from './ViewAccessibilityTypes';

export type AccessibilityLevel = 'auto' | 'yes' | 'no' | 'no-hide-descendants';

export type BackfaceVisibility = 'visible' | 'hidden';

export interface ViewBaseProps extends PropsBase {
  transform?: TransformMatrix;
}

export interface HitSlop {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

export type ViewRawProps = RawPropsBase & ViewStyle &
ViewAccessibility & {
  hitSlop?: HitSlop;
  focusable?: boolean;
};

/**
 * @deprecated: Use ViewRawProps
 */
export type ViewDynamicProps = ViewRawProps;

export type BorderRadii = {
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
};

export type BorderColors = {
  left?: ColorSegments;
  top?: ColorSegments;
  right?: ColorSegments;
  bottom?: ColorSegments;
};

export type BorderWidths = {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
};
