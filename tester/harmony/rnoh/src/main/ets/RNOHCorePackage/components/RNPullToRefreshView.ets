import { Descriptor, RawPropsBase } from '../../RNOH';
import { RNOHContext } from '../../RNOH'

export interface PullToRefreshProps {}

export interface PullToRefreshRawProps extends RawPropsBase {
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
  @State loadingOpacity: number = 0
  @BuilderParam renderDescriptors: () => void
  @State private descriptor: PullToRefreshDescriptor = Object() as PullToRefreshDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined
  private cleanUpCallbacks: (() => void)[] = []
  @State private isRefreshing: boolean = false // ignore linter, this variable is read
  private prevAndCurrentRefreshStatus: [RefreshStatus, RefreshStatus] = [RefreshStatus.Inactive, RefreshStatus.Inactive]

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<PullToRefreshDescriptor>(this.tag)
    this.cleanUpCallbacks.push(this.ctx.componentCommandReceiver.registerCommandCallback(
      this.tag,
      (command, args: [boolean]) => {
        if (command === 'setNativeRefreshing') {
          this.isRefreshing = args[0]
        }
      }));
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor as PullToRefreshDescriptor)
      }
    ));
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cleanUp => cleanUp())
  }

  onDescriptorChange(descriptor: PullToRefreshDescriptor) {
    this.descriptor = descriptor
    this.isRefreshing = !!this.descriptor.rawProps.refreshing
  }

  handleRefresh() {
    /**
     * We set this here to true and leave the responsibility of controlling it to the react-native side. If the developer
     * doesn't set the refreshing prop of RefreshControl in react-native to true, then this will be turned off when the
     * descriptor updates.
     */
    this.isRefreshing = true;

    // Emit this event only when a user initiated pull to refresh, not when RN changed `refreshing` prop.
    if ([RefreshStatus.Drag, RefreshStatus.OverDrag].includes(this.prevAndCurrentRefreshStatus[0])) {
      this.ctx.rnInstance.emitComponentEvent(
        this.descriptor.tag,
        "refresh",
        {}
      )
    }
  }

  @Builder
  RefreshLoadingProgress(params: RefreshLoadingProgressBuilderParams) {
    LoadingProgress()
      .width('112px')
      .height('112px')
      .color(params.tintColor)
      .translate({x: 0,y: (typeof params.progressOffsetView === 'number' ? params.progressOffsetView+ 'px' : 0)})
      .opacity(this.loadingOpacity)
      .animation({ duration: 300 })
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
      if (refreshStatus === RefreshStatus.Drag || refreshStatus === RefreshStatus.OverDrag || refreshStatus === RefreshStatus.Refresh) {
        this.loadingOpacity = 1
      }
      if (refreshStatus === RefreshStatus.Inactive || refreshStatus === RefreshStatus.Done) {
        this.loadingOpacity = 0;
      }
    })
    .onRefreshing(() => this.handleRefresh())
  }
}
