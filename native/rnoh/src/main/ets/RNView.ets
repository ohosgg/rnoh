import rnoh from 'librnoh.so'
import { ColorSegments, Descriptor, LayoutProps, Tag } from './descriptor'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { DescriptorRegistry } from './DescriptorRegistry'
import { ReactEventKind } from './events'

export type ViewProps = LayoutProps & {
  backgroundColor?: ColorSegments
  borderWidth?: number
  borderColor?: ColorSegments
  borderRadius?: number
}

export type ViewDescriptor = Descriptor<"View", ViewProps>

@Component
export struct RNView {
  @State tag: number = -1
  @Link descriptorRegistry: DescriptorRegistry
  @BuilderParam renderDescriptors: (parentTag: number) => void

  getDescriptor(): ViewDescriptor {
    return this.descriptorRegistry.getDescriptor<ViewDescriptor>(this.tag)
  }

  onTouchEvent(event: TouchEvent) {
    rnoh?.emitEvent(this.getDescriptor().tag, ReactEventKind.TOUCH, event)
  }

  build() {
    Stack() {
      this.renderDescriptors(this.tag)
    }
    .width(this.getDescriptor().props.width)
    .height(this.getDescriptor().props.height)
    .backgroundColor(convertColorSegmentsToString(this.getDescriptor().props.backgroundColor))
    .position({ y: this.getDescriptor().props.top, x: this.getDescriptor().props.left })
    .borderWidth(this.getDescriptor().props.borderWidth)
    .borderColor(convertColorSegmentsToString(this.getDescriptor().props.borderColor))
    .borderRadius(this.getDescriptor().props.borderRadius)
    .onTouch((event) => this.onTouchEvent(event))
  }
}