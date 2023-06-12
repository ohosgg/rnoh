import libRNOHApp from 'librnoh_app.so'
import Device from '@system.device'
import { RNComponentFactory, ComponentBuilderContext } from './RNComponentFactory'
import { RNOHContext } from "./RNOHContext"
import { Descriptor } from './descriptor'
import { ViewProps } from './RNView'
import { convertColorValueToRGBA } from './cpp-bridge-utils'
import type { DeviceInfoTurboModule } from "./RNOHCorePackage/TurboModules/DeviceInfoTurboModule"
import JavaScriptLoader from "./JavaScriptLoader"
import RNOHLogger from "./RNOHLogger"
import { startTrace, finishTrace } from './tracer';
import common from '@ohos.app.ability.common'


@Component
@Preview
export struct RNApp {
  rnohContext: RNOHContext
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State screenDensity: number = 0
  @State shouldShow: boolean = false
  @State dev: boolean = false
  private initialSurfaceWidth: number = 0
  private initialSurfaceHeight: number = 0

  aboutToAppear() {
    // delay running the app so that debugger has a chance to connect before a potential error is thrown
    startTrace("INITIALIZATION")
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
      },
      })
      this.rnohContext.rnInstance?.initializeReactNative();
      this.shouldShow = true
      finishTrace("INITIALIZATION")
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
          buildCustomComponent: this.buildCustomComponent,
          screenDensity: this.screenDensity,
          initialSurfaceWidth: this.initialSurfaceWidth,
          initialSurfaceHeight: this.initialSurfaceHeight,
          bundleUrl: this.rnohContext.rnInstance.getBundleUrl()
        })
      } else {
        Text("Loading...")
      }
    }.width("100%").height("100%").backgroundColor("#EEE")
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
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State initialSurfaceWidth: number = 0
  @State initialSurfaceHeight: number = 0
  @Prop screenDensity: number
  @State descriptor: RootDescriptor = rootDescriptor
  bundleUrl: string
  private cleanup?: () => void = undefined

  aboutToAppear() {
    this.ctx.rnInstance.subscribeToShadowTreeChanges((mutations) => {
      this.updateDescriptorRegistry(mutations)
    }, (tag, commandName, args) => {
      this.dispatchCommand(tag, commandName, args)
    });

    const javaScriptLoader = new JavaScriptLoader();
    javaScriptLoader.loadBundle(this.bundleUrl)
      .catch((error) => {
        // NOTE: temporary fallback to local bundle file,
        // until we figure out how to pass bundle URL as launch param
        // to the Ark app
        RNOHLogger.error(error);
        RNOHLogger.info("Falling back to local bundle.");
        return javaScriptLoader.loadBundle("bundle.harmony.js")
      }).then((bundle) => {
      this.ctx.rnInstance.run(this.initialSurfaceWidth / this.screenDensity, this.initialSurfaceHeight / this.screenDensity, bundle)
    }).catch((error) => {
      RNOHLogger.error(error)
      // TODO: don't use empty string as a magic "failure" value
      this.ctx.rnInstance.run(this.initialSurfaceWidth / this.screenDensity, this.initialSurfaceHeight / this.screenDensity, "")
    });
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
    .backgroundColor(convertColorValueToRGBA(this.descriptor.props.backgroundColor))
  }
}
