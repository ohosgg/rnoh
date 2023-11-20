import { DimensionValue } from './RNTypes';

export type Point = {
  x: number,
  y: number,
}

export type Position = {
  x: number,
  y: number,
}

export type BoundingBox = {
  left: number,
  right: number,
  top: number,
  bottom: number,
}

export interface Size {
  width: number;
  height: number;
}

export type Edges<T> = {
  top: T,
  left: T,
  right: T,
  bottom: T
}

export type Corners<T> = {
  topLeft: T,
  topRight: T,
  bottomLeft: T,
  bottomRight: T,
}

export type PointerEvents = "auto" | "none" | "box-none" | "box-only"

export class CompactValue {
  constructor(private parentLength, private rawValue: DimensionValue) {
  }

  public get asNumber(): number {
    if (typeof this.rawValue === 'number') {
      return this.rawValue;
    }
    else if (typeof this.rawValue === 'string' && this.rawValue !== 'auto') {
      return Number.parseFloat(this.rawValue) * (this.parentLength) / 100;
    }
    return 0;
  }
}
