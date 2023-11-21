import { RNOHContext, Tag } from '../../RNOH'
import { RNViewBase, ViewBaseDescriptor } from './RNViewBase'
import { ComponentBuilderContext, RNComponentFactory } from './RNComponentFactory'

@Component
export struct RNView {
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam public buildCustomComponent: (ctx: ComponentBuilderContext) => void

  @State private childrenTags: Tag[] = []
  private cleanupCallback?: () => void = undefined

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(this.tag)
    if (descriptor) {
      this.updateDescriptor(descriptor)
    }
    this.cleanupCallback = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
      this.tag,
      (newDescriptor) => this.updateDescriptor(newDescriptor)
    )
  }

  updateDescriptor(descriptor: ViewBaseDescriptor) {
    this.childrenTags = descriptor.childrenTags;
  }

  aboutToDisappear() {
    this.cleanupCallback?.()
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      ForEach(this.childrenTags, (childrenTag: Tag) => {
        RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
      }, (childrenTag: Tag) => childrenTag.toString())
    }
  }
}