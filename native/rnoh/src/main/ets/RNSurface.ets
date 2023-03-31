import rnoh from 'librnoh.so'
import { DescriptorRegistry } from './DescriptorRegistry'
import { RNComponentFactory } from './RNComponentFactory'
import { Descriptor } from './descriptor'
import { ViewProps } from './RNView'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import Device from '@system.device'


@Component
@Preview
export struct RNApp {
  @State screenDensity: number = 0
  private initialSurfaceWidth: number = 0
  private initialSurfaceHeight: number = 0

  aboutToAppear() {
    rnoh?.initializeReactNative()
    Device.getInfo({ success: (data) => {
      this.screenDensity = data.screenDensity
    } })
  }

  onLayout(children, constraint) {
    this.initialSurfaceWidth = constraint.maxWidth
    this.initialSurfaceHeight = constraint.maxHeight
  }

  build() {
    Stack() {
      if (this.screenDensity > 0) {
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
  @State descriptorRegistry: DescriptorRegistry = new DescriptorRegistry({
    '1': { ...rootDescriptor },
  });
  @Prop screenDensity: number

  aboutToAppear() {
    rnoh?.subscribeToShadowTreeChanges((mutations) => {
      this.updateDescriptorRegistry(mutations)
    });
    rnoh.startReactNative(this.initialSurfaceWidth / this.screenDensity, this.initialSurfaceHeight / this.screenDensity)
  }

  updateDescriptorRegistry(mutations) {
    this.descriptorRegistry.applyMutations(mutations)
  }

  getCurrentDescriptor() {
    return this.descriptorRegistry.getDescriptor<RootDescriptor>(1)
  }

  build() {
    Row() {
      Column() {
        Flex({ direction: FlexDirection.Column }) {
          ForEach(this.getCurrentDescriptor().childrenTags, (childrenTag) => {
            RNComponentFactory({ tag: childrenTag, descriptorRegistry: $descriptorRegistry })
          }, childrenTag => childrenTag)
        }
        .width("100%")
        .height("100%")
        .backgroundColor(convertColorSegmentsToString(this.getCurrentDescriptor().props.backgroundColor))
      }
      .height("100%")
      .width('100%')
    }
    .height('100%')
    .alignItems(VerticalAlign.Top)
  }
}

