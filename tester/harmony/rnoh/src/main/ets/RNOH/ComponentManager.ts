export type Point = {
  x: number,
  y: number,
}

export type BoundingBox = {
  left: number,
  right: number,
  top: number,
  bottom: number,
}

export abstract class ComponentManager {}
