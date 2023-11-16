import { RNOHContext, Tag } from '../../RNOH'
import { RNViewBase, ViewBaseDescriptor } from './RNViewBase'
import { RNComponentFactory, ComponentBuilderContext } from './RNComponentFactory'

@Component
export struct RNView {
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam public buildCustomComponent: (ctx: ComponentBuilderContext) => void

  @State private childrenTags: Tag[] = []
  @State private isFocusable: boolean = false
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
    this.isFocusable = descriptor.rawProps.focusable ?? false;
  }

  aboutToDisappear() {
    this.cleanupCallback?.()
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
      isFocusable: this.isFocusable,
    }) {
      ForEach(this.childrenTags, (childrenTag: Tag) => {
        RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
      }, (childrenTag: Tag) => childrenTag.toString())
    }
  }
}