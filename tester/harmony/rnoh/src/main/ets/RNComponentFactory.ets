import { RNView } from "./RNOHCorePackage/components/RNView"
import { RNImage } from "./RNOHCorePackage/components/RNImage"
import { RNTextInput } from "./RNOHCorePackage/components/RNTextInput"
import { RNText } from "./RNOHCorePackage/components/RNText"
import { RNScrollView } from "./RNOHCorePackage/components/RNScrollView"
import { Descriptor, Tag } from "./RNOH/DescriptorBase"
import { RNOHContext } from "./RNOH/RNOHContext"
import { RNModalHostView } from './RNOHCorePackage/components/RNModalHostView'
import { RNSwitch } from './RNOHCorePackage/components/RNSwitch'
import { RNPullToRefreshView } from './RNOHCorePackage/components/RNPullToRefreshView'
import { RNActivityIndicator } from './RNOHCorePackage/components/RNActivityIndicator'

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
    if (descriptor) {
      this.setDescriptor(descriptor)
    }
    this.cleanupCallback = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
      this.tag,
      (newDescriptor) => this.setDescriptor(newDescriptor)
    )
  }

  aboutToDisappear() {
    this.cleanupCallback?.()
  }

  setDescriptor(newDescriptor: Descriptor) {
    this.descriptorType = newDescriptor.type
    this.childrenTags = newDescriptor.childrenTags
  }

  @Builder
  renderDescriptors() {
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
      RNText({ ctx: this.ctx, tag: this.tag, buildChildren: this.renderDescriptors.bind(this) })
    } else if (this.descriptorType === "PullToRefreshView") {
      /**
       * RNScrollView displays Refresh component if PullToRefreshView is its direct parent.
       * Native Refresh component works correctly, only when a native Scroll is its direct child.
       */
      RNComponentFactory({
        ctx: this.ctx,
        tag: this.childrenTags[0],
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    }
    else if (this.descriptorType === "ScrollView") {
      RNScrollView({
        ctx: this.ctx,
        tag: this.tag,
        renderDescriptors: this.renderDescriptors.bind(this)
      })
    } else if (this.descriptorType === "Switch") {
      RNSwitch({
        ctx: this.ctx,
        tag: this.tag,
      })
    } else if (this.descriptorType === "ModalHostView") {
      RNModalHostView({
        ctx: this.ctx,
        tag: this.tag,
        renderDescriptors: this.renderDescriptors.bind(this)
      })
    } else if (this.descriptorType === "ActivityIndicatorView") {
      RNActivityIndicator({
        ctx: this.ctx,
        tag: this.tag,
      })
    } else if (this.descriptorType !== '') {
      this.buildCustomComponent({
        rnohContext: this.ctx,
        descriptor: this.ctx.descriptorRegistry.getDescriptor(this.tag)
      })
    }
  }
}