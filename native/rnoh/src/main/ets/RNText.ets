import rnoh from 'librnoh.so'
import {LayoutProps, ColorSegments, Tag, Descriptor} from "./descriptor"
import {DescriptorRegistry} from "./DescriptorRegistry"
import {ReactEventKind} from "./events"

export type TextDescriptorProps = LayoutProps & {
  text?: string
}

export type TextDescriptor = Descriptor<"Paragraph", TextDescriptorProps>

@Component
export struct RNText {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry

  getDescriptor() {
    return this.descriptorRegistry.getDescriptor<TextDescriptor>(this.tag)
  }

  onTouchEvent(event: TouchEvent) {
    rnoh?.emitEvent(this.getDescriptor().tag, ReactEventKind.TOUCH, event)
  }

  build() {
    Text(this.getDescriptor().props.text)
      .width(this.getDescriptor().props.width)
      .height(this.getDescriptor().props.height)
      .position({y: this.getDescriptor().props.top, x: this.getDescriptor().props.left})
      .onTouch((event) => this.onTouchEvent(event))
  }
}