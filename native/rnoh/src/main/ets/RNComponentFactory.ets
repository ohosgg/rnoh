import {RNView} from "./RNView"
import {DescriptorRegistry} from "./DescriptorRegistry"


@Component
export struct RNComponentFactory {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry

  getDescriptorType() {
    return this.descriptorRegistry.getDescriptor(this.tag).type
  }

  aboutToAppear() {
    console.log(`[RNOH] aboutToAppear tag: ${this.tag}`)
    console.log(`[RNOH] descriptor: ${JSON.stringify(this.descriptorRegistry.getDescriptor(this.tag))}`)
  }

  @Builder renderDescriptors(parentTag: number) {
    ForEach(this.descriptorRegistry.getDescriptor(parentTag).childrenTags, (childrenTag) => {
      RNComponentFactory({tag: childrenTag, descriptorRegistry: $descriptorRegistry})
    }, childrenTag => childrenTag)
  }

  build() {
    Stack() {
      if (this.getDescriptorType() === "View") {
        RNView({tag: this.tag, descriptorRegistry: $descriptorRegistry, renderDescriptors: this.renderDescriptors})
      }
    }.width("100%").height("100%")
  }
}