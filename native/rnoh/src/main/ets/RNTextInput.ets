import rnoh from 'librnoh.so'
import {LayoutProps, ColorSegments, Tag, Descriptor} from "./descriptor"
import {convertColorSegmentsToString} from "./cpp-bridge-utils"
import {DescriptorRegistry} from "./DescriptorRegistry"
import {ReactEventKind} from "./events"

export type TextInputDescriptorProps = LayoutProps & {
  backgroundColor?: ColorSegments
  fontColor?: ColorSegments
  fontSize?: number
  text?: string
  borderWidth?: number
  borderColor?: ColorSegments
  borderRadius?: number
}

export type TextInputDescriptor = Descriptor<"TextInput", TextInputDescriptorProps>

@Component
export struct RNTextInput {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry

  getDescriptor() {
    return this.descriptorRegistry.getDescriptor<TextInputDescriptor>(this.tag)
  }

  onTouchEvent(event: TouchEvent) {
    rnoh?.emitEvent(this.getDescriptor().tag, ReactEventKind.TOUCH, event)
  }

  relayChangeEvent(value: string) {
    rnoh?.emitEvent(this.getDescriptor().tag, ReactEventKind.TEXT_INPUT_CHANGE, value)
  }

  build() {
    TextInput()
    .width(this.getDescriptor().props.width)
    .height(this.getDescriptor().props.height)
    .position({y: this.getDescriptor().props.top, x: this.getDescriptor().props.left})
    .backgroundColor(convertColorSegmentsToString(this.getDescriptor().props.backgroundColor))
    .fontColor(convertColorSegmentsToString(this.getDescriptor().props.fontColor))
    .fontSize(this.getDescriptor().props.fontSize)
    .borderWidth(this.getDescriptor().props.borderWidth)
    .borderColor(convertColorSegmentsToString(this.getDescriptor().props.borderColor))
    .borderRadius(this.getDescriptor().props.borderRadius)
    .onChange((event) => this.relayChangeEvent(event))
//    .onTouch((event) => this.onTouchEvent(event))
  }
}