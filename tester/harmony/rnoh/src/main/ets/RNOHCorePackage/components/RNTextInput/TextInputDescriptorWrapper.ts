import type { Descriptor } from '../../../RNOH/DescriptorBase';
import type { DimensionValue } from '../../../RNOH/RNTypes';
import { CompactValue, Edges, Point } from '../../../RNOH/types';
import { ViewDescriptorWrapperBase } from '../RNViewBase/ViewDescriptorWrapper';
import { TextInputProps, TextInputRawProps, TextInputState } from './types';
import { convertColorSegmentsToString } from '../../../RNOH/CppBridgeUtils';

export class TextInputDescriptorWrapper extends ViewDescriptorWrapperBase<string, TextInputProps, TextInputState, TextInputRawProps> {
  constructor(descriptor: Descriptor<string, TextInputProps, TextInputState, TextInputRawProps>) {
    super(descriptor)
  }

  public get padding(): Edges<DimensionValue> {
    return this.resolveEdges({
      all: this.rawProps.padding,
      top: this.rawProps.paddingTop,
      left: this.rawProps.paddingLeft,
      right: this.rawProps.paddingRight,
      bottom: this.rawProps.paddingBottom,
      start: this.rawProps.paddingStart,
      end: this.rawProps.paddingEnd,
    })
  }

  public get position(): Point {
    return {
      x: new CompactValue(this.width, this.padding.left).asNumber,
      y: new CompactValue(this.height, this.padding.top).asNumber,
    }
  }

  public get contentWidth(): number {
    return this.getValueDecreasedByPadding(this.width, this.padding.left, this.padding.right);
  }

  public get contentHeight(): number {
    return this.getValueDecreasedByPadding(this.height, this.padding.top, this.padding.bottom);
  }

  public get fontWeight(): number | undefined {
    return this.rawProps.fontWeight;
  }

  public get fontFamily(): string | undefined {
    return this.rawProps.fontFamily;
  }

  public get fontSize(): number | undefined {
    return this.rawProps.fontSize;
  }

  public get fontColor(): string {
    return convertColorSegmentsToString(this.rawProps.fontColor);
  }

  public get fontStyle(): string {
    return this.rawProps.fontStyle;
  }

  public get focusable(): boolean {
    return this.rawProps.focusable;
  }

  private getValueDecreasedByPadding(value: number | undefined, paddingBefore: DimensionValue, paddingAfter: DimensionValue): number {
    if (value !== undefined) {
      const paddingBeforeAsNumber = new CompactValue(value, paddingBefore).asNumber;
      const paddingAfterAsNumber = new CompactValue(value, paddingAfter).asNumber;
      return value - paddingBeforeAsNumber - paddingAfterAsNumber;
    }
    return 0;
  }
}