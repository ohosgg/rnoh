import { Descriptor} from '../../RNOH';
import { RNOHContext } from '../../RNOH'

export interface PullToRefreshProps {}

export interface PullToRefreshRawProps {
  refreshing?: boolean
  progressViewOffset?: number
  tintColor?: string
}

export interface PullToRefreshState {}

export interface RefreshLoadingProgressBuilderParams {
  progressOffsetView?: number
  tintColor?: ResourceColor
}

export const RN_PULL_TO_REFRESH_VIEW_NAME: string = "PullToRefreshView"
export type PullToRefreshDescriptor = Descriptor<"PullToRefreshView", PullToRefreshProps, PullToRefreshState, PullToRefreshRawProps>

@Component
export struct RNPullToRefreshView {
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam renderDescriptors: () => void
  @State private descriptor: PullToRefreshDescriptor = Object() as PullToRefreshDescriptor
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
    this.isRefreshing = !!this.descriptor.rawProps.refreshing
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
      if (!this.descriptor.rawProps.refreshing) {
        this.isRefreshing = false
      }
    }, 500)
  }

  @Builder
  RefreshLoadingProgress(params: RefreshLoadingProgressBuilderParams) {
    LoadingProgress()
      .width('112px')
      .height('112px')
      .color(params.tintColor)
      .margin({ top: `${params.progressOffsetView}px` ?? 0 })
  }

  build() {
    Refresh({
      refreshing: this.isRefreshing,
      builder: this.RefreshLoadingProgress({
        progressOffsetView: this.descriptor.rawProps.progressViewOffset,
        tintColor: this.descriptor.rawProps.tintColor,
      }),
    }) {
      this.renderDescriptors();
    }
    .onStateChange((refreshStatus) => {
      this.prevAndCurrentRefreshStatus = [this.prevAndCurrentRefreshStatus[1], refreshStatus]
    })
    .onRefreshing(() => this.handleRefresh())
  }
}
