/** 0-1 */
export type NormalizedScalar = number

/** RGBA */
export type ColorSegments = [
  NormalizedScalar,
  NormalizedScalar,
  NormalizedScalar,
  NormalizedScalar
]

export type Tag = number

export type LayoutProps = {
  top: number
  left: number
  width: number
  height: number
}

export type Descriptor<TType = string, TProps extends Object = Object> = {
  type: TType
  tag: Tag
  props: TProps
  childrenTags: Tag[]
}
