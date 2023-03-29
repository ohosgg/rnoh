import {RNView} from "./RNView"
import {RNImage} from "./RNImage"
import {RNTextInput} from "./RNTextInput"
import {RNText} from "./RNText"
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
    if (this.getDescriptorType() === "View") {
      RNView({tag: this.tag, descriptorRegistry: $descriptorRegistry, renderDescriptors: this.renderDescriptors})
    } else if (this.getDescriptorType() === "Image") {
      RNImage({tag: this.tag, descriptorRegistry: $descriptorRegistry})
    } else if (this.getDescriptorType() === "TextInput") {
      RNTextInput({tag: this.tag, descriptorRegistry: $descriptorRegistry})
    } else if (this.getDescriptorType() === "Paragraph") {
      RNText({tag: this.tag, descriptorRegistry: $descriptorRegistry})
    }
  }
}