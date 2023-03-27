import rnoh from 'librnoh.so'
import {LayoutProps, ColorSegments, Tag, Descriptor} from "./descriptor"
import {DescriptorRegistry} from "./DescriptorRegistry"
import {ReactEventKind} from "./events"

export type ImageDescriptorProps = LayoutProps & {
  uri: string
}

export type ImageDescriptor = Descriptor<"Image", ImageDescriptorProps>

@Component
export struct RNImage {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry

  getDescriptor() {
    return this.descriptorRegistry.getDescriptor<ImageDescriptor>(this.tag)
  }

  onTouchEvent(event: TouchEvent) {
    rnoh?.emitEvent(this.getDescriptor().tag, ReactEventKind.TOUCH, event)
  }

  build() {
    Image(this.getDescriptor().props.uri)
    .width(this.getDescriptor().props.width)
    .height(this.getDescriptor().props.height)
    .position({y: this.getDescriptor().props.top, x: this.getDescriptor().props.left})
    .onTouch((event) => this.onTouchEvent(event))
  }
}