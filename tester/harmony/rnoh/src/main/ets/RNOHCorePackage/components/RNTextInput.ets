import { ColorSegments, Descriptor } from '../../RNOH/DescriptorBase'
import { convertColorSegmentsToString } from '../../RNOH'
import { RNViewBase, ViewProps } from './RNView'
import { RNOHContext } from '../../RNOH/RNOHContext'
import { RNOHEventEmitRequestHandlerName } from "./.."

export type TextInputProps = ViewProps & {
  fontColor?: ColorSegments
  fontSize?: number
  text?: string
}

export type TextInputDescriptor = Descriptor<"TextInput", TextInputProps>

@Component
export struct RNTextInput {
  ctx: RNOHContext
  tag: number
  @State descriptor: TextInputDescriptor = {} as TextInputDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  handleChangeEvent(value: string) {
    this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, RNOHEventEmitRequestHandlerName.TextInputChange, value)
  }

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<TextInputDescriptor>(this.tag)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as TextInputDescriptor)
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  build() {
    RNViewBase({ctx: this.ctx, tag: this.tag}) {
      TextInput()
        .width("100%")
        .height("100%")
        .fontColor(convertColorSegmentsToString(this.descriptor.props.fontColor))
        .fontSize(this.descriptor.props.fontSize)
        .onChange((event) => this.handleChangeEvent(event))
    }
  }
}