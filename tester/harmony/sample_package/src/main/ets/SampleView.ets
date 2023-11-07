import { Descriptor, ComponentBuilderContext, ViewDynamicProps2, RNOHContext, RNViewBase, Tag } from 'rnoh';

export const SAMPLE_VIEW_TYPE: string = "SampleView"

export type SampleViewDescriptor = Descriptor<"SampleView", ViewDynamicProps2>


@Component
export struct SampleView {
  ctx!: RNOHContext
  tag: number = 0
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
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Text(JSON.stringify(this.descriptor.childrenTags)).fontColor("white").fontSize(12)
      ForEach(this.descriptor.childrenTags, (tag: Tag) => {
        this.buildCustomComponent({
          rnohContext: this.ctx,
          descriptor: this.ctx.descriptorRegistry.getDescriptor(tag)
        })
      }, (tag: Tag) => tag.toString())
    }
  }
}
