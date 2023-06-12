import { ColorSegments, Descriptor } from './descriptor'
import { convertColorSegmentsToString, convertColorValueToRGBA } from './cpp-bridge-utils'
import { ViewProps } from './RNView'
import { RNOHContext } from './RNOHContext'
import { RNOHEventEmitRequestHandlerName } from "./RNOHCorePackage"

export type TextInputProps = ViewProps & {
  fontColor?: ColorSegments
  fontSize?: number
  text?: string
}

export type TextInputDescriptor = Descriptor<"TextInput", TextInputProps>

@Component
export struct RNTextInput {
  ctx: RNOHContext
  @State tag: number = -1
  @Prop descriptor: TextInputDescriptor

  handleChangeEvent(value: string) {
    this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, RNOHEventEmitRequestHandlerName.TextInputChange, value)
  }

  build() {
    TextInput()
      .width(this.descriptor.props.width)
      .height(this.descriptor.props.height)
      .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
      .backgroundColor(convertColorValueToRGBA(this.descriptor.props.backgroundColor))
      .fontColor(convertColorSegmentsToString(this.descriptor.props.fontColor))
      .fontSize(this.descriptor.props.fontSize)
      .borderWidth(this.descriptor.props.borderWidth)
      .borderColor(convertColorValueToRGBA(this.descriptor.props.borderColor))
      .borderRadius(this.descriptor.props.borderRadius)
      .onChange((event) => this.handleChangeEvent(event))
  }
}