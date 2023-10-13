import { RNOHContext, Tag } from '../../RNOH'
import { RNViewBase, ViewBaseDescriptor } from './RNViewBase'
import { RNComponentFactory, ComponentBuilderContext } from './RNComponentFactory'

@Component
export struct RNView {
  ctx: RNOHContext
  tag: number
  @BuilderParam public buildCustomComponent: (ctx: ComponentBuilderContext) => void

  @State private childrenTags: Tag[] = []
  private cleanupCallback?: () => void = undefined

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(this.tag)
    if (descriptor) {
      this.childrenTags = descriptor.childrenTags
    }
    this.cleanupCallback = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
      this.tag,
      (newDescriptor) => {
        this.childrenTags = newDescriptor.childrenTags
      }
    )
  }

  aboutToDisappear() {
    this.cleanupCallback?.()
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      ForEach(this.childrenTags, (childrenTag) => {
        RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
      }, childrenTag => childrenTag)
    }
  }
}