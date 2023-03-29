import rnoh from 'librnoh.so'
import { ColorSegments, Descriptor, Tag } from './descriptor'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { DescriptorRegistry } from './DescriptorRegistry'
import { ReactEventKind } from './events'
import { ViewProps } from './RNView'

export type TextInputProps = ViewProps & {
  fontColor?: ColorSegments
  fontSize?: number
  text?: string
}

export type TextInputDescriptor = Descriptor<"TextInput", TextInputProps>

@Component
export struct RNTextInput {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry

  getDescriptor() {
    return this.descriptorRegistry.getDescriptor<TextInputDescriptor>(this.tag)
  }

  relayChangeEvent(value: string) {
    rnoh?.emitEvent(this.getDescriptor().tag, ReactEventKind.TEXT_INPUT_CHANGE, value)
  }

  build() {
    TextInput()
      .width(this.getDescriptor().props.width)
      .height(this.getDescriptor().props.height)
      .position({ y: this.getDescriptor().props.top, x: this.getDescriptor().props.left })
      .backgroundColor(convertColorSegmentsToString(this.getDescriptor().props.backgroundColor))
      .fontColor(convertColorSegmentsToString(this.getDescriptor().props.fontColor))
      .fontSize(this.getDescriptor().props.fontSize)
      .borderWidth(this.getDescriptor().props.borderWidth)
      .borderColor(convertColorSegmentsToString(this.getDescriptor().props.borderColor))
      .borderRadius(this.getDescriptor().props.borderRadius)
      .onChange((event) => this.relayChangeEvent(event))
  }
}