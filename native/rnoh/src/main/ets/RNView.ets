import {LayoutProps, ColorSegments, Tag, Descriptor} from "./descriptor"
import {convertColorSegmentsToString} from "./cpp-bridge-utils"
import {DescriptorRegistry} from "./DescriptorRegistry"

export type ViewDescriptorProps = LayoutProps & {
  backgroundColor?: ColorSegments
}

export type ViewDescriptor = Descriptor<"View", ViewDescriptorProps>

@Component
export struct RNView {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry
  @BuilderParam renderDescriptors: (parentTag: number) => void

  getDescriptor(): ViewDescriptor {
    return this.descriptorRegistry.getDescriptor<ViewDescriptor>(this.tag)
  }

  build() {
    Stack() {
      this.renderDescriptors(this.tag)
    }
    .width(this.getDescriptor().props.width)
    .height(this.getDescriptor().props.height)
    .backgroundColor(convertColorSegmentsToString(this.getDescriptor().props.backgroundColor))
    .position({y: this.getDescriptor().props.top, x: this.getDescriptor().props.left})
  }
}