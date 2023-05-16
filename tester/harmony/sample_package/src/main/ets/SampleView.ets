import { Descriptor, ComponentBuilderContext, RNComponentFactory, convertColorValueToRGBA } from '@ohos/rnoh'

export const SAMPLE_VIEW_TYPE = "SampleView" as const

export type SampleViewDescriptor = Descriptor<typeof SAMPLE_VIEW_TYPE, { size: number, backgroundColor: number }>

@Component
export struct SampleView {
  @Prop descriptor: SampleViewDescriptor
  private cleanupCallback?: () => void = undefined

  //  aboutToAppear() {
  //    this.descriptor = this.descriptorRegistry.getDescriptor(this.tag)
  //    this.cleanupCallback = this.descriptorRegistry.subscribeToDescriptorChanges(this.tag, (newDescriptor) => this.descriptor = newDescriptor)
  //  }
  //
  //  aboutToDisappear() {
  //    this.cleanupCallback?.()
  //  }


  build() {
    Stack() {
    }
    .width(this.descriptor.props.size)
    .height(this.descriptor.props.size)
    .position(this.descriptor.layoutMetrics.frame.origin)
    .backgroundColor(this.descriptor.props.backgroundColor ? convertColorValueToRGBA(this.descriptor.props.backgroundColor) : undefined)
  }
}
