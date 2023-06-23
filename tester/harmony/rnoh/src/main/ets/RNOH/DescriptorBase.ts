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