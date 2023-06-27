import { RNView } from "./RNOHCorePackage/Components/RNView"
import { RNImage } from "./RNOHCorePackage/Components/RNImage"
import { RNTextInput } from "./RNOHCorePackage/Components/RNTextInput"
import { RNText } from "./RNOHCorePackage/Components/RNText"
import { RNScrollView } from "./RNOHCorePackage/Components/RNScrollView"
import { Descriptor, Tag } from "./RNOH/DescriptorBase"
import { RNOHContext } from "./RNOH/RNOHContext"

export type ComponentBuilderContext = {
  rnohContext: RNOHContext
  descriptor: Descriptor
}

@Component
export struct RNComponentFactory {
  ctx: RNOHContext
  tag: number
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State descriptorType: string = ''
  @State childrenTags: Tag[] = []
  private cleanupCallback?: () => void = undefined

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor(this.tag)
    this.descriptorType = descriptor.type
    this.setDescriptor(descriptor)
    this.cleanupCallback = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
      this.tag,
      (newDescriptor) => this.setDescriptor(newDescriptor)
    )
  }

  aboutToDisappear() {
    this.cleanupCallback?.()
  }

  setDescriptor(newDescriptor: Descriptor) {
    this.childrenTags = newDescriptor.childrenTags
  }

  @Builder renderDescriptors() {
    ForEach(this.childrenTags, (childrenTag) => {
      RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
    }, childrenTag => childrenTag)
  }

  build() {
    if (this.descriptorType === "View") {
      RNView({
        ctx: this.ctx,
        tag: this.tag,
        renderDescriptors: this.renderDescriptors.bind(this)
      })
    } else if (this.descriptorType === "Image") {
      RNImage({ ctx: this.ctx, tag: this.tag })
    } else if (this.descriptorType === "TextInput") {
      RNTextInput({ ctx: this.ctx, tag: this.tag })
    } else if (this.descriptorType === "Paragraph") {
      RNText({ ctx: this.ctx, tag: this.tag })
    } else if (this.descriptorType === "ScrollView") {
      RNScrollView({
        ctx: this.ctx,
        tag: this.tag,
        renderDescriptors: this.renderDescriptors.bind(this)
      })
    } else if (this.descriptorType !== '') {
      this.buildCustomComponent({ rnohContext: this.ctx, descriptor: this.ctx.descriptorRegistry.getDescriptor(this.tag) })
    }
  }
}