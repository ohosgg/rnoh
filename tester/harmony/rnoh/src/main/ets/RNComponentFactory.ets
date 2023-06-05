import { RNView, ViewDescriptor } from "./RNView"
import { RNImage, ImageDescriptor } from "./RNImage"
import { RNTextInput, TextInputDescriptor } from "./RNTextInput"
import { RNText, TextDescriptor } from "./RNText"
import { RNScrollView, ScrollViewDescriptor } from "./RNScrollView"
import { Descriptor } from "./descriptor"
import { DescriptorRegistry } from "./DescriptorRegistry"
import { RNOHContext } from "./RNOHContext"

// placeholder value used as the initializer for
// the `descriptor` @State field in `RNComponentFactory`
const nullDescriptor = {
  type: "null",
  tag: -1,
  props: {},
  state: {},
  childrenTags: [],
  layoutMetrics: {
    frame: {
      origin: {
        x: 0,
        y: 0,
      },
      size: {
        width: 0,
        height: 0,
      }
    }
  }
}

export type ComponentBuilderContext = {
  rnohContext: RNOHContext
  descriptor: Descriptor
}

@Component
export struct RNComponentFactory {
  ctx: RNOHContext
  tag: number = -1
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State descriptor: Descriptor = nullDescriptor
  private cleanupCallback?: () => void = undefined

  getDescriptorType() {
    return this.descriptor.type
  }

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor(this.tag)
    this.cleanupCallback = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
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
      RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
    }, childrenTag => childrenTag)
  }

  build() {
    if (this.getDescriptorType() === "View") {
      RNView({
        ctx: this.ctx,
        tag: this.tag,
        renderDescriptors: this.renderDescriptors.bind(this),
        descriptor: this.descriptor as ViewDescriptor
      })
    } else if (this.getDescriptorType() === "Image") {
      RNImage({ ctx: this.ctx, tag: this.tag, descriptor: this.descriptor as ImageDescriptor })
    } else if (this.getDescriptorType() === "TextInput") {
      RNTextInput({ ctx: this.ctx, tag: this.tag, descriptor: this.descriptor as TextInputDescriptor })
    } else if (this.getDescriptorType() === "Paragraph") {
      RNText({ ctx: this.ctx, tag: this.tag, descriptor: this.descriptor as TextDescriptor })
    } else if (this.getDescriptorType() === "ScrollView") {
      RNScrollView({
        ctx: this.ctx,
        tag: this.tag,
        renderDescriptors: this.renderDescriptors.bind(this),
        descriptor: this.descriptor as ScrollViewDescriptor
      })
    } else {
      this.buildCustomComponent({ rnohContext: this.ctx, descriptor: this.descriptor })
    }
  }
}