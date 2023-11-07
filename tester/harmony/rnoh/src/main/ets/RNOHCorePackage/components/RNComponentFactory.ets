import { RNOHContext, Descriptor, DescriptorEssence } from "../../RNOH"
import { RNView } from "./RNView"
import { RNImage } from "./RNImage"
import { RNTextInput } from "./RNTextInput"
import { RNText } from "./RNText"
import { RNScrollView } from "./RNScrollView"
import { RNModalHostView } from './RNModalHostView'
import { RNSwitch } from './RNSwitch'
import { RNActivityIndicator } from './RNActivityIndicator'
import { RNPullToRefreshView } from './RNPullToRefreshView'

export interface ComponentBuilderContext {
  rnohContext: RNOHContext
  descriptor: DescriptorEssence
}

export type CustomComponentBuilder = (ctx: ComponentBuilderContext) => void

@Component
export struct RNComponentFactory {
  public ctx!: RNOHContext
  public tag: number = 0
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  @State private descriptorType: string = ''
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
  }

  build() {
    if (this.descriptorType === RNView.NAME) {
      RNView({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    } else if (this.descriptorType === RNImage.NAME) {
      RNImage({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    } else if (this.descriptorType === RNTextInput.NAME) {
      RNTextInput({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    } else if (this.descriptorType === RNText.NAME) {
      RNText({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    } else if (this.descriptorType === RNPullToRefreshView.NAME) {
      RNPullToRefreshView({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    } else if (this.descriptorType === RNScrollView.NAME) {
      RNScrollView({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    } else if (this.descriptorType === RNSwitch.NAME) {
      RNSwitch({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    } else if (this.descriptorType === RNModalHostView.NAME) {
      RNModalHostView({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    } else if (this.descriptorType === RNActivityIndicator.NAME) {
      RNActivityIndicator({ ctx: this.ctx, tag: this.tag, buildCustomComponent: this.buildCustomComponent })
    }
  }
}