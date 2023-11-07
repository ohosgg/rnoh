import { Tag, RNOHContext } from "../../RNOH"
import { RNView } from "./RNView"
import { RNImage } from "./RNImage"
import { RNTextInput } from "./RNTextInput"
import { RNText } from "./RNText"
import { RNScrollView } from "./RNScrollView"
import { Descriptor } from "../../RNOH/DescriptorBase";
import { RNModalHostView } from './RNModalHostView'
import { RNSwitch } from './RNSwitch'
import { RNActivityIndicator } from './RNActivityIndicator'

export interface ComponentBuilderContext {
  rnohContext: RNOHContext
  descriptor: DescriptorEssence
}

interface DescriptorEssence {
  tag: Tag,
  type: string
}

export type CustomComponentBuilder = (ctx: ComponentBuilderContext) => void

@Component
export struct RNComponentFactory {
  public ctx!: RNOHContext
  public tag: number = 0
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  @State private descriptorType: string = ''
  @State private childrenTags: Tag[] = []
  private cleanupCallback?: () => void = undefined

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<Descriptor>(this.tag)
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

  build() {
    if (this.descriptorType === "View") {
      RNView({
        ctx: this.ctx,
        tag: this.tag,
        buildCustomComponent: this.buildCustomComponent
      })
    } else if (this.descriptorType === "Image") {
      RNImage({ ctx: this.ctx, tag: this.tag })
    } else if (this.descriptorType === "TextInput") {
      RNTextInput({ ctx: this.ctx, tag: this.tag })
    } else if (this.descriptorType === "Paragraph") {
      RNText({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    } else if (this.descriptorType === "PullToRefreshView") {
      /**
       * RNScrollView displays Refresh component if PullToRefreshView is its direct parent.
       * Native Refresh component works correctly, only when a native Scroll is its direct child.
       */
      RNComponentFactory({
        ctx: this.ctx,
        tag: this.childrenTags[0],
        buildCustomComponent: this.buildCustomComponent
      })
    }
    else if (this.descriptorType === "ScrollView") {
      RNScrollView({
        ctx: this.ctx,
        tag: this.tag,
        buildCustomComponent: this.buildCustomComponent
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
        buildCustomComponent: this.buildCustomComponent
      })
    } else if (this.descriptorType === "ActivityIndicatorView") {
      RNActivityIndicator({
        ctx: this.ctx,
        tag: this.tag,
      })
    } else if (this.descriptorType !== '') {
      this.buildCustomComponent({
        rnohContext: this.ctx,
        descriptor: this.ctx.descriptorRegistry.getDescriptor<Descriptor>(this.tag) as DescriptorEssence
      })
    }
  }
}