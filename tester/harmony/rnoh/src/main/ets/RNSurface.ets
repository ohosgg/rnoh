import { RNComponentFactory, ComponentBuilderContext } from './RNComponentFactory'
import { RNOHContext } from "./RNOH"
import { Descriptor } from './RNOH'
import { ViewProps } from './RNOHCorePackage/Components/RNView'
import { convertColorSegmentsToString } from './RNOH'


export type RootDescriptor = Descriptor<"RootView", ViewProps>

const rootDescriptor: RootDescriptor = {
  isDynamicBinder: false,
  type: 'RootView',
  tag: 1,
  childrenTags: [],
  props: { top: 0, left: 0, width: 0, height: 0 },
  state: {},
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

@Component
export struct RNSurface {
  ctx: RNOHContext
  appName: string
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State initialSurfaceWidth: number = 0
  @State initialSurfaceHeight: number = 0
  @Prop screenDensity: number
  @State descriptor: RootDescriptor = rootDescriptor
  private cleanup?: () => void = undefined

  aboutToAppear() {
    this.ctx.rnInstance.subscribeToShadowTreeChanges((mutations) => {
      this.updateDescriptorRegistry(mutations)
    }, (tag, commandName, args) => {
      this.dispatchCommand(tag, commandName, args)
    });
    this.ctx.surfaceLifecycle.onSurfaceAboutToAppear({
      appName: this.appName,
      width: this.initialSurfaceWidth,
      height: this.initialSurfaceHeight,
      screenDensity: this.screenDensity
    })
    this.cleanup = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
      1,
      (newDescriptor) => this.onUpdateComponent(newDescriptor)
    )
  }

  aboutToDisappear() {
    this.cleanup?.();
  }

  updateDescriptorRegistry(mutations) {
    this.ctx.descriptorRegistry.applyMutations(mutations)
  }

  dispatchCommand(tag, commandName, args) {
    this.ctx.commandDispatcher.dispatchCommand(tag, commandName, args)
  }

  onUpdateComponent(newDescriptor: Descriptor) {
    this.descriptor = newDescriptor as RootDescriptor
  }

  build() {
    Stack() {
      ForEach(this.descriptor.childrenTags, (childrenTag) => {
        RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
      }, childrenTag => childrenTag)
    }
    .width("100%")
    .height("100%")
    .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
  }
}
