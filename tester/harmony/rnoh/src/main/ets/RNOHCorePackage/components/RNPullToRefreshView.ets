import { Descriptor, RNOHContext } from '../../RNOH'

export type PullToRefreshProps = {
  refreshing?: boolean
}

export const RN_PULL_TO_REFRESH_VIEW_NAME = "PullToRefreshView" as const
export type PullToRefreshDescriptor = Descriptor<typeof RN_PULL_TO_REFRESH_VIEW_NAME, PullToRefreshProps>

@Component
export struct RNPullToRefreshView {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderDescriptors: () => void
  @State private descriptor: PullToRefreshDescriptor = {} as PullToRefreshDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined
  @State private isRefreshing: boolean = false // ignore linter, this variable is read
  private prevAndCurrentRefreshStatus: [RefreshStatus, RefreshStatus] = [RefreshStatus.Inactive, RefreshStatus.Inactive]

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<PullToRefreshDescriptor>(this.tag)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor as PullToRefreshDescriptor)
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  onDescriptorChange(descriptor: PullToRefreshDescriptor) {
    this.descriptor = descriptor
    this.isRefreshing = !!this.descriptor.props.refreshing
  }

  handleRefresh() {
    // Emit this event only when a user initiated pull to refresh, not when RN changed `refreshing` prop.
    if ([RefreshStatus.Drag, RefreshStatus.OverDrag].includes(this.prevAndCurrentRefreshStatus[0])) {
      this.ctx.rnInstance.emitComponentEvent(
        this.descriptor.tag,
        "refresh",
        {}
      )
    }

    /**
     * `Refresh` should not be active, if `refreshing` prop is set to `false`. When a user activates the `Refresh`,
     * the component sets `isRefreshing` to `true`. For unknown reason, if `isRefreshing` is set to `false` here
     * without timeout, and soon after `isRefreshing` is set back to `true` by `refreshing` prop,
     * that second change is ignored.
     */
    setTimeout(() => {
      if (!this.descriptor.props.refreshing) {
        this.isRefreshing = false
      }
    }, 500)
  }

  build() {
    Refresh({
      refreshing: $$this.isRefreshing
    }) {
      this.renderDescriptors();
    }
    .onStateChange((refreshStatus) => {
      this.prevAndCurrentRefreshStatus = [this.prevAndCurrentRefreshStatus[1], refreshStatus]
    })
    .onRefreshing(this.handleRefresh.bind(this))
  }
}