import { ColorSegments, Descriptor, convertColorSegmentsToString, RNOHContext } from '../../RNOH'
import { ViewBaseProps, RNViewBase } from './RNViewBase'

export type PullToRefreshProps = ViewBaseProps & {
  refreshing?: boolean
}

export type PullToRefreshDescriptor = Descriptor<"PullToRefreshView", PullToRefreshProps>

@Component
export struct RNPullToRefreshView {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderDescriptors: () => void
  @State private descriptor: PullToRefreshDescriptor = {} as PullToRefreshDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<PullToRefreshDescriptor>(this.tag)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as PullToRefreshDescriptor)
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  onRefresh() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      "refresh",
      {}
    )
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      Refresh({
        refreshing: this.descriptor.props.refreshing
      }) {
        this.renderDescriptors();
      }
      .onRefreshing(this.onRefresh.bind(this))
    }
  }
}