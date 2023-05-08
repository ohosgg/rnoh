import { RNView, ViewDescriptor } from "./RNView"
import { RNImage, ImageDescriptor } from "./RNImage"
import { RNTextInput, TextInputDescriptor } from "./RNTextInput"
import { RNText, TextDescriptor } from "./RNText"
import { RNScrollView, ScrollViewDescriptor } from "./RNScrollView"
import { Descriptor } from "./descriptor"
import { DescriptorRegistry } from "./DescriptorRegistry"

// placeholder value used as the initializer for
// the `descriptor` @State field in `RNComponentFactory`
const nullDescriptor = {
  type: "null",
  tag: -1,
  props: {},
  state: {},
  childrenTags: []
}

export type ComponentBuilderContext = {
  descriptor: Descriptor
}

@Component
export struct RNComponentFactory {
  tag: number = -1
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State descriptor: Descriptor = nullDescriptor
  @Consume('__RN_DESCRIPTOR_REGISTRY') descriptorRegistry: DescriptorRegistry
  private cleanupCallback?: () => void = undefined

  getDescriptorType() {
    return this.descriptor.type
  }

  aboutToAppear() {
    this.descriptor = this.descriptorRegistry.getDescriptor(this.tag)
    this.cleanupCallback = this.descriptorRegistry.registerComponentUpdateCallback(
    this.tag,
      (newDescriptor) => this.onUpdateComponent(newDescriptor)
    )
  }

  aboutToDisappear() {
    this.cleanupCallback?.()
  }

  onUpdateComponent(newDescriptor: Descriptor) {
    this.descriptor = newDescriptor
  }

  @Builder renderDescriptors() {
    ForEach(this.descriptor.childrenTags, (childrenTag) => {
      RNComponentFactory({ tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
    }, childrenTag => childrenTag)
  }

  build() {
    if (this.getDescriptorType() === "View") {
      RNView({
        tag: this.tag,
        renderDescriptors: this.renderDescriptors.bind(this),
        descriptor: this.descriptor as ViewDescriptor
      })
    } else if (this.getDescriptorType() === "Image") {
      RNImage({ tag: this.tag, descriptor: this.descriptor as ImageDescriptor })
    } else if (this.getDescriptorType() === "TextInput") {
      RNTextInput({ tag: this.tag, descriptor: this.descriptor as TextInputDescriptor })
    } else if (this.getDescriptorType() === "Paragraph") {
      RNText({ tag: this.tag, descriptor: this.descriptor as TextDescriptor })
    } else if (this.getDescriptorType() === "ScrollView") {
      RNScrollView({
        tag: this.tag,
        renderDescriptors: this.renderDescriptors.bind(this),
        descriptor: this.descriptor as ScrollViewDescriptor
      })
    } else {
      this.buildCustomComponent({ descriptor: this.descriptor })
    }
  }
}