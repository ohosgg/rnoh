import rnohAppNapiBridge from 'librnoh_app_napi_bridge.so'
import Device from '@system.device'
import { DescriptorRegistry } from './DescriptorRegistry'
import { CommandDispatcher } from './CommandDispatcher'
import { RNComponentFactory } from './RNComponentFactory'
import { Descriptor } from './descriptor'
import { ViewProps } from './RNView'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { TurboModuleProvider } from './TurboModuleProvider'
import type { DeviceInfoTurboModule } from "./RNOHCorePackage/TurboModules/DeviceInfoTurboModule"
import { RNInstance } from "./RNInstance"

@Component
@Preview
export struct RNApp {
  @Provide("RNInstance") rnInstance: RNInstance | null = null
  @State screenDensity: number = 0
  @State shouldShow: boolean = false
  private initialSurfaceWidth: number = 0
  private initialSurfaceHeight: number = 0

  aboutToAppear() {
    // delay running the app so that debugger has a chance to connect before a potential error is thrown
    this.rnInstance?.setRNOHAppNapiBridge(rnohAppNapiBridge)
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
    }, 1000)

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
  state: {}
}

@Component
export struct RNSurface {
  @Consume("RNInstance") rnInstance: RNInstance
  @State initialSurfaceWidth: number = 0
  @State initialSurfaceHeight: number = 0
  @Prop screenDensity: number
  @State descriptor: RootDescriptor = rootDescriptor

  @Provide('__RN_DESCRIPTOR_REGISTRY') 
  descriptorRegistry: DescriptorRegistry =
    new DescriptorRegistry({
      '1': { ...rootDescriptor },
    });

  @Provide('__RN_COMMAND_DISPATCHER') 
  commandDispatcher: CommandDispatcher = new CommandDispatcher()

  private cleanup?: () => void = undefined

  aboutToAppear() {
    this.rnInstance.subscribeToShadowTreeChanges((mutations) => {
      this.updateDescriptorRegistry(mutations)
    }, (tag, commandName, args) => {
      this.dispatchCommand(tag, commandName, args)
    });
    this.rnInstance.run(this.initialSurfaceWidth / this.screenDensity, this.initialSurfaceHeight / this.screenDensity)
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

  dispatchCommand(tag, commandName, args) {
    this.commandDispatcher.dispatchCommand(tag, commandName, args)
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

