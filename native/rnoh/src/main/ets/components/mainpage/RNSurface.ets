import rnoh from 'librnoh.so'
import {DescriptorRegistry, updateDescriptorByTagFromMutations, ViewDescriptor} from "../../DescriptorRegistry"

const viewDescriptor1 = new ViewDescriptor({
  type: 'View',
  tag: 1,
  props: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    backgroundColor: [1, 1, 1, 1]
  }
})

@Preview
@Component
export struct RNSurface {
  @State descriptorRegistry: DescriptorRegistry = {descriptorByTag: {'1': viewDescriptor1}};


  aboutToAppear() {
    rnoh?.subscribeToShadowTreeChanges((mutations)=> {
      this.updateDescriptorRegistry(mutations)
    });
  }

  getDescriptorChildrenTags() {
    return this.descriptorRegistry.descriptorByTag['1'].childrenTags
  }

  updateDescriptorRegistry(mutations) {
    const newDescriptorByTag = updateDescriptorByTagFromMutations(this.descriptorRegistry.descriptorByTag, mutations)
    this.descriptorRegistry.descriptorByTag = newDescriptorByTag
  }

  build() {
    Row() {
      Column() {
        Stack() {
            ForEach(this.getDescriptorChildrenTags(), (childrenTag) => {
              RNComponent({tag: childrenTag, descriptorRegistry: $descriptorRegistry})
            }, childrenTag => childrenTag)
        }.width("100%").height("50%")
        Button("Start RN")
          .onClick(
            () => {
              rnoh.startReactNative()
            }
          )
        Scroll() {
          Text(JSON.stringify(this.descriptorRegistry, null, 2))
        }.height(300)
      }
      .width('100%')
    }
    .height('100%')
    .backgroundColor("gray")
    .alignItems(VerticalAlign.Top)
  }
}

@Component
struct RNComponent {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry

  getDescriptorChildrenTags() {
    const tag = this.tag.toString()
    const descriptor = this.descriptorRegistry.descriptorByTag[tag]
    const result = descriptor?.childrenTags ?? []
    return result;
  }

  getDescriptorData() {
    return this.descriptorRegistry.descriptorByTag[this.tag.toString()]?.data
  }

  convertColorToString(color?: Color) {
    if (!color) return undefined
    return `rgba(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)}, 1)`
  }

  build() {
    Stack() {
      if (this.getDescriptorData()?.type === "View") {
        Stack() {
          ForEach(this.getDescriptorChildrenTags(), (childrenTag) => {
            RNComponent({tag: childrenTag, descriptorRegistry: $descriptorRegistry})
          }, childrenTag => childrenTag)
        }
        .width(this.getDescriptorData().props.width)
        .height(this.getDescriptorData().props.height)
        .backgroundColor(this.convertColorToString(this.getDescriptorData().props.backgroundColor))
        .position({y: this.getDescriptorData().props.top, x: this.getDescriptorData().props.left})
      }
    }.width("100%").height("100%")
  }
}