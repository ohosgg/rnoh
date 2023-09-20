/** 0-1 */
export type NormalizedScalar = number;

/** RGBA */
export type ColorSegments = [
  NormalizedScalar,
  NormalizedScalar,
  NormalizedScalar,
  NormalizedScalar,
];

export type ColorValue = number;

export type Tag = number;

export type LayoutProps = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export enum LayoutDirectionRN {
  Undefined = 0,
  LeftToRight = 1,
  RightToLeft = 2,
};

export type LayoutMetrics = {
  frame: {
    origin: {
      x: number;
      y: number;
    };
    size: {
      width: number;
      height: number;
    };
  };
  layoutDirection?: LayoutDirectionRN;
};

export enum OverflowMode {
  VISIBLE = 0,
  HIDDEN = 1,
  SCROLL = 2,
};

export type Descriptor<TType = string,
TProps extends Object = Object,
TState = {}> = {
  type: TType;
  tag: Tag;
  parentTag?: Tag;
  props: TProps;
  state: TState;
  childrenTags: Tag[];
  layoutMetrics: LayoutMetrics;
  isDynamicBinder: boolean;
};

export type BorderMetrics = {
  borderWidth?: number;
  borderLeftWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;

  borderColor?: number;
  borderLeftColor?: number;
  borderTopColor?: number;
  borderRightColor?: number;
  borderBottomColor?: number;
  borderStartColor?: number;
  borderEndColor?: number;

  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;

  borderStyle?: string;
}