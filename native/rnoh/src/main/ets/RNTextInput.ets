import rnoh from 'librnoh.so'
import {LayoutProps, ColorSegments, Tag, Descriptor} from "./descriptor"
import {convertColorSegmentsToString} from "./cpp-bridge-utils"
import {DescriptorRegistry} from "./DescriptorRegistry"
import {ReactEventKind} from "./events"

export type TextInputDescriptorProps = LayoutProps & {
  text?: string
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

  build() {
    TextInput({text: this.getDescriptor().props.text})
    .width(this.getDescriptor().props.width)
    .height(this.getDescriptor().props.height)
    .position({y: this.getDescriptor().props.top, x: this.getDescriptor().props.left})
//    .onTouch((event) => this.onTouchEvent(event))
  }
}