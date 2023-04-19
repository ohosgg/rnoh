import rnoh from 'librnoh.so'
import { DescriptorRegistry } from './DescriptorRegistry'
import { RNComponentFactory } from './RNComponentFactory'
import { Descriptor } from './descriptor'
import { ViewProps } from './RNView'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import Device from '@system.device'
import { TurboModuleProvider } from './TurboModuleProvider'
import { TurboModuleFactory } from './TurboModuleFactory'
import type { DeviceInfoTurboModule } from "./RNOHCorePackage/TurboModules/DeviceInfoTurboModule"

const turboModuleProvider = new TurboModuleProvider(new TurboModuleFactory())

@Component
@Preview
export struct RNApp {
  @State screenDensity: number = 0
  @State shouldShow: boolean = false
  private initialSurfaceWidth: number = 100
  private initialSurfaceHeight: number = 100

  aboutToAppear() {
    // delay running the app so that debugger has a chance to connect before a potential error is thrown
    rnoh?.registerTurboModuleProvider(turboModuleProvider)
    setTimeout(() => {
      Device.getInfo({ success: (data) => {
        this.screenDensity = data.screenDensity
        const deviceInfoTurboModule = turboModuleProvider.getModule<DeviceInfoTurboModule>("DeviceInfo")
        console.log("RNOH::JS setInitialDeviceMetrics")
        deviceInfoTurboModule.setInitialDeviceMetrics({
          width: data.windowWidth,
          height: data.windowHeight,
          scale: data.screenDensity,
          fontScale: data.screenDensity,
        })
      } })
    }, 1000)
    console.log("RNOH::JS initializeReactNative")
    rnoh?.initializeReactNative()
    console.log("RNOH::JS setting should show to true")
    this.shouldShow = true
  }

  onLayout(children, constraint) {
    this.initialSurfaceWidth = constraint.maxWidth
    this.initialSurfaceHeight = constraint.maxHeight
  }

  build() {
    Stack() {
      if (this.screenDensity > 0 && this.shouldShow) {
        RNSurface({
          screenDensity: this.screenDensity,
          initialSurfaceWidth: this.initialSurfaceWidth,
          initialSurfaceHeight: this.initialSurfaceHeight
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
}

@Component
export struct RNSurface {
  @State initialSurfaceWidth: number = 0
  @State initialSurfaceHeight: number = 0
  @Prop screenDensity: number
  @State descriptor: RootDescriptor = rootDescriptor
  @Provide('__RN_DESCRIPTOR_REGISTRY') descriptorRegistry: DescriptorRegistry =
    new DescriptorRegistry({
      '1': { ...rootDescriptor },
    });
  private cleanup?: () => void = undefined

  aboutToAppear() {
    console.log("RNOH::JS Subscribing to shadow tree changes")
    rnoh?.subscribeToShadowTreeChanges((mutations) => {
      this.updateDescriptorRegistry(mutations)
    });
    rnoh.startReactNative(this.initialSurfaceWidth / this.screenDensity, this.initialSurfaceHeight / this.screenDensity)
    this.cleanup = this.descriptorRegistry.registerComponentUpdateCallback(
      1,
      (newDescriptor) => this.onUpdateComponent(newDescriptor)
    )
  }

  aboutToDisappear() {
    this.cleanup?.();
  }

  updateDescriptorRegistry(mutations) {
    this.descriptorRegistry.applyMutations(mutations)
  }

  onUpdateComponent(newDescriptor: Descriptor) {
    this.descriptor = newDescriptor as RootDescriptor
  }

  build() {
    Row() {
      Column() {
        Flex({ direction: FlexDirection.Column }) {
          ForEach(this.descriptor.childrenTags, (childrenTag) => {
            RNComponentFactory({ tag: childrenTag })
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

