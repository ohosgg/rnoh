import {
  Descriptor,
  ComponentBuilderContext,
  RNComponentFactory,
  convertColorValueToRGBA,
  DescriptorRegistry,
  RNOHContext
} from '@ohos/rnoh'

export const SAMPLE_VIEW_TYPE = "SampleView" as const

export type SampleViewDescriptor = Descriptor<typeof SAMPLE_VIEW_TYPE, {
  size: number,
  backgroundColor: number
}>

@Component
export struct SampleView {
  @Consume("RNOHContext") ctx: RNOHContext
  tag: number

  @BuilderParam buildChildren: (childrenTags: number[]) => void
  @State refreshKey: number = 0
  private descriptor: SampleViewDescriptor | undefined = undefined
  private cleanupCallback?: () => void = undefined

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<SampleViewDescriptor>(this.tag)
    this.cleanupCallback = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as SampleViewDescriptor)
        this.refreshKey++
      }
    )
  }

  aboutToDisappear() {
    this.cleanupCallback?.()
  }

  build() {
    if (this.descriptor != undefined) {
      Stack() {
        this.buildChildren(this.descriptor.childrenTags)
      }
      .width(this.descriptor.props.size)
      .height(this.descriptor.props.size)
      .position(this.descriptor.layoutMetrics.frame.origin)
      .backgroundColor(this.descriptor.props.backgroundColor ? convertColorValueToRGBA(this.descriptor.props.backgroundColor) : undefined)
    }
  }
}
