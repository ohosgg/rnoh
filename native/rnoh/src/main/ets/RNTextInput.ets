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
  @Prop descriptor: TextInputDescriptor

  relayChangeEvent(value: string) {
    rnoh?.emitEvent(this.descriptor.tag, ReactEventKind.TEXT_INPUT_CHANGE, value)
  }

  build() {
    TextInput()
      .width(this.descriptor.props.width)
      .height(this.descriptor.props.height)
      .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
      .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
      .fontColor(convertColorSegmentsToString(this.descriptor.props.fontColor))
      .fontSize(this.descriptor.props.fontSize)
      .borderWidth(this.descriptor.props.borderWidth)
      .borderColor(convertColorSegmentsToString(this.descriptor.props.borderColor))
      .borderRadius(this.descriptor.props.borderRadius)
      .onChange((event) => this.relayChangeEvent(event))
  }
}