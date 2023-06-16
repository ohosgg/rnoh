import libRNOHApp from 'librnoh_app.so'
import Device from '@system.device'
import { RNComponentFactory, ComponentBuilderContext } from './RNComponentFactory'
import { RNOHContext } from "./RNOHContext"
import { Descriptor } from './descriptor'
import { ViewProps } from './RNView'
import { convertColorSegmentsToString, convertColorValueToRGBA } from './cpp-bridge-utils'
import type { DeviceInfoTurboModule } from "./RNOHCorePackage/TurboModules/DeviceInfoTurboModule"
import { startTrace, finishTrace } from './tracer';


@Component
@Preview
export struct RNApp {
  rnohContext: RNOHContext
  appName: string
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State screenDensity: number = 0
  @State shouldShow: boolean = false
  @State dev: boolean = false
  private initialSurfaceWidth: number = 0
  private initialSurfaceHeight: number = 0

  aboutToAppear() {
    // delay running the app so that debugger has a chance to connect before a potential error is thrown
    this.rnohContext.rnInstance?.setLibRNOHApp(libRNOHApp)
    this.rnohContext.rnInstance?.registerTurboModuleProvider();
    setTimeout(() => {
      Device.getInfo({ success: (data) => {
        this.screenDensity = data.screenDensity
        const deviceInfoTurboModule = this.rnohContext.rnInstance.getTurboModule<DeviceInfoTurboModule>("DeviceInfo");
        deviceInfoTurboModule.setInitialParameters({
          screenPhysicalPixels: {
            width: data.windowWidth,
            height: data.windowHeight,
            scale: data.screenDensity,
            fontScale: 1,
            densityDpi: 1,
          },
          windowPhysicalPixels: {
            width: data.windowWidth,
            height: data.windowHeight,
            scale: data.screenDensity,
            fontScale: 1,
            densityDpi: 1,
          }
        });
        this.rnohContext.rnInstance?.initializeReactNative(data.screenDensity);
        this.shouldShow = true
      }})
    }, this.dev ? 2000 : 0)
  }

  onLayout(children, constraint) {
    this.initialSurfaceWidth = constraint.maxWidth
    this.initialSurfaceHeight = constraint.maxHeight
  }

  build() {
    Stack() {
      if (this.screenDensity > 0 && this.shouldShow) {
        RNSurface({
          ctx: this.rnohContext,
          appName: this.appName,
          buildCustomComponent: this.buildCustomComponent,
          screenDensity: this.screenDensity,
          initialSurfaceWidth: this.initialSurfaceWidth,
          initialSurfaceHeight: this.initialSurfaceHeight,
        })
      }
    }.width("100%").height("100%")
  }
}

export type RootDescriptor = Descriptor<"RootView", ViewProps>

const rootDescriptor: RootDescriptor = {
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
