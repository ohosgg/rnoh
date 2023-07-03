import { Descriptor, RNOHContext, RNViewBase, ViewDynamicProps } from '@ohos/rnoh'

export type PropsDisplayerDescriptor = Descriptor<"PropsDisplayer", ViewDynamicProps>

@Component
export struct PropsDisplayer {
  static NAME = "PropsDisplayer" as const
  ctx: RNOHContext
  tag: number
  private unregisterDescriptorChangesListener?: () => void = undefined
  @State private descriptor: PropsDisplayerDescriptor = {} as PropsDisplayerDescriptor

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<PropsDisplayerDescriptor>(this.tag)
    this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag, () => {
      this.descriptor = this.ctx.descriptorRegistry.getDescriptor<PropsDisplayerDescriptor>(this.tag)
    })
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Text(JSON.stringify(this.descriptor?.props ?? {})).width("100%").height("100%").fontSize(12).fontColor("#AAA")
    }
  }
}
