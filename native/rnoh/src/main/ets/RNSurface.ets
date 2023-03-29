import rnoh from 'librnoh.so'
import {DescriptorRegistry} from "./DescriptorRegistry"
import {RNComponentFactory} from './RNComponentFactory'
import {Descriptor} from './descriptor'

export type RootDescriptor = Descriptor<"RootView", {}>

const rootDescriptor: RootDescriptor = {
  type: 'RootView',
  tag: 1,
  childrenTags: [],
  props: {},
}

@Preview
@Component
export struct RNSurface {
  @State descriptorRegistry: DescriptorRegistry = new DescriptorRegistry({
    '1': {...rootDescriptor},
  });
  @State started: boolean = false;

  aboutToAppear() {
    rnoh?.subscribeToShadowTreeChanges((mutations)=> {
      this.updateDescriptorRegistry(mutations)
    });
  }

  getDescriptorChildrenTags() {
    return this.descriptorRegistry.getDescriptor(1).childrenTags
  }

  updateDescriptorRegistry(mutations) {
    this.descriptorRegistry.applyMutations(mutations)
  }

  build() {
    Row() {
      Column() {
        Flex({direction: FlexDirection.Column}) {
            ForEach(this.getDescriptorChildrenTags(), (childrenTag) => {
              RNComponentFactory({tag: childrenTag, descriptorRegistry: $descriptorRegistry})
            }, childrenTag => childrenTag)
        }
        .width("100%")
        .height(700)
        .shadow({radius: 16})
        .backgroundColor("white")

        Button("Start RN")
          .margin({top: 16})
          .onClick(() => rnoh.startReactNative())

      }
      .height("100%")
      .width('100%')
    }
    .height('100%')
    .backgroundColor("#DDD")
    .alignItems(VerticalAlign.Top)
  }
}

