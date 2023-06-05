import {
  DescriptorClass,
  ComponentBuilderContext,
  RNComponentFactory,
  convertColorValueToRGBA,
  RNOHContext,
} from '@ohos/rnoh'

export const SAMPLE_VIEW_TYPE = "SampleView" as const

export class SampleViewDescriptor extends DescriptorClass<typeof SAMPLE_VIEW_TYPE, {
  size: number,
  backgroundColor: number
}> {
}

@Component
export struct SampleView {
  ctx: RNOHContext
  tag: number
  @BuilderParam buildCustomComponent: (componentBuilderContext: ComponentBuilderContext) => void
  @State descriptor: SampleViewDescriptor = {} as SampleViewDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<SampleViewDescriptor>(this.tag)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as SampleViewDescriptor)
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  build() {
    Stack() {
      Text(JSON.stringify(this.descriptor.childrenTags)).fontColor("blue")
      ForEach(this.descriptor.childrenTags, (tag) => {
        RNComponentFactory({ ctx: this.ctx, tag: tag, buildCustomComponent: this.buildCustomComponent })
      }, tag => tag)
    }
    .alignContent(Alignment.TopStart)
    .width(this.descriptor.props.size)
    .height(this.descriptor.props.size)
    .position(this.descriptor.layoutMetrics.frame.origin)
    .backgroundColor(this.descriptor.props.backgroundColor ? convertColorValueToRGBA(this.descriptor.props.backgroundColor) : undefined)
  }
}
