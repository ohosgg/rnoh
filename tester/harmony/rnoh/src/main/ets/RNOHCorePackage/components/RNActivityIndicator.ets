import type { ColorSegments, Descriptor} from '../../RNOH';
import { convertColorSegmentsToString, RNOHContext } from '../../RNOH'
import type { ViewBaseProps} from './RNViewBase';
import { RNViewBase } from './RNViewBase'

export type ActivityIndicatorProps = ViewBaseProps & {
  animating?: boolean,
  color?: ColorSegments,
}

export type ActivityIndicatorDescriptor = Descriptor<"ActivityIndicatorView", ActivityIndicatorProps>

@Component
export struct RNActivityIndicator {
  ctx: RNOHContext
  tag: number
  @State private descriptor: ActivityIndicatorDescriptor = {} as ActivityIndicatorDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<ActivityIndicatorDescriptor>(this.tag)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as ActivityIndicatorDescriptor)
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      LoadingProgress()
        .color(convertColorSegmentsToString(this.descriptor.props.color))
        .enableLoading(this.descriptor.props.animating)
    }
  }
}