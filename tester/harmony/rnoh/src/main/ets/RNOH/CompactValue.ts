import { DimensionValue } from "./RNTypes"

export class CompactValue {
  constructor(private rawValue: DimensionValue, private parentLength: number) {
  }

  public asNumber(): number {
    if (typeof this.rawValue === 'number') {
      return this.rawValue;
    }
    else if (typeof this.rawValue === 'string' && this.rawValue !== 'auto') {
      return Number.parseFloat(this.rawValue) * (this.parentLength) / 100;
    }
    return 0;
  }
}
