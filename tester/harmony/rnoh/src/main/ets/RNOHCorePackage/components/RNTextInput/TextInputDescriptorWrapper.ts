import { Point, Descriptor, convertColorSegmentsToString } from '../../../RNOH';
import { ViewDescriptorWrapperBase } from '../RNViewBase/ViewDescriptorWrapper';
import { TextInputProps, TextInputRawProps, TextInputState } from './types';


export class TextInputDescriptorWrapper extends ViewDescriptorWrapperBase<string, TextInputProps, TextInputState, TextInputRawProps> {
  constructor(descriptor: Descriptor<string, TextInputProps, TextInputState, TextInputRawProps>) {
    super(descriptor)
  }

  public get position(): Point {
    return {
      x: this.padding.left.asNumber(),
      y: this.padding.top.asNumber(),
    }
  }

  public get contentWidth(): number {
    return this.width - (this.padding.left.asNumber() + this.padding.right.asNumber())
  }

  public get contentHeight(): number {
    return this.height - (this.padding.top.asNumber() + this.padding.bottom.asNumber())
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

  public get autoFocus(): boolean {
    return this.rawProps.autoFocus ?? false;
  }
}