import libRNOHApp from 'librnoh_app.so'
import Device from '@system.device'
import { RNComponentFactory, ComponentBuilderContext } from './RNComponentFactory'
import { RNOHContext } from "./RNOHContext"
import { Descriptor } from './descriptor'
import { ViewProps } from './RNView'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import type { DeviceInfoTurboModule } from "./RNOHCorePackage/TurboModules/DeviceInfoTurboModule"
import { RNInstance } from "./RNInstance"
import JavaScriptLoader from "./JavaScriptLoader"
import RNOHLogger from "./RNOHLogger"
import { startTrace, finishTrace } from './tracer';


@Component
@Preview
export struct RNApp {
  @Provide("RNInstance") rnInstance: RNInstance | null = null
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State screenDensity: number = 0
  @State shouldShow: boolean = false
  @State dev: boolean = false
  private initialSurfaceWidth: number = 0
  private initialSurfaceHeight: number = 0

  aboutToAppear() {
    // delay running the app so that debugger has a chance to connect before a potential error is thrown
    startTrace("INITIALIZATION")
    this.rnInstance?.setLibRNOHApp(libRNOHApp)
    this.rnInstance?.registerTurboModuleProvider();
    setTimeout(() => {
      Device.getInfo({ success: (data) => {
        this.screenDensity = data.screenDensity
        const deviceInfoTurboModule = this.rnInstance.getTurboModule<DeviceInfoTurboModule>("DeviceInfo")
        deviceInfoTurboModule.setInitialDeviceMetrics({
          width: data.windowWidth,
          height: data.windowHeight,
          scale: data.screenDensity,
          fontScale: data.screenDensity,
        })
      } })
      this.rnInstance?.initializeReactNative();
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
          buildCustomComponent: this.buildCustomComponent,
          screenDensity: this.screenDensity,
          initialSurfaceWidth: this.initialSurfaceWidth,
          initialSurfaceHeight: this.initialSurfaceHeight,
          bundleUrl: this.rnInstance.getBundleUrl()
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
  @Consume("RNInstance") rnInstance: RNInstance
  @Consume("RNOHContext") ctx: RNOHContext
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State initialSurfaceWidth: number = 0
  @State initialSurfaceHeight: number = 0
  @Prop screenDensity: number
  @State descriptor: RootDescriptor = rootDescriptor
  bundleUrl: string
  private cleanup?: () => void = undefined

  aboutToAppear() {
    this.rnInstance.subscribeToShadowTreeChanges((mutations) => {
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
      this.rnInstance.run(this.initialSurfaceWidth / this.screenDensity, this.initialSurfaceHeight / this.screenDensity, bundle)
    }).catch((error) => {
      RNOHLogger.error(error)
      // TODO: don't use empty string as a magic "failure" value
      this.rnInstance.run(this.initialSurfaceWidth / this.screenDensity, this.initialSurfaceHeight / this.screenDensity, "")
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
    Row() {
      Column() {
        Flex({ direction: FlexDirection.Column }) {
          ForEach(this.descriptor.childrenTags, (childrenTag) => {
            RNComponentFactory({ tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
          }, childrenTag => childrenTag)
        }
        .width("100%")
        .height("100%")
        .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
      }
      .height("100%")
      .width('100%')
    }
    .height('100%')
    .alignItems(VerticalAlign.Top)
  }
}
