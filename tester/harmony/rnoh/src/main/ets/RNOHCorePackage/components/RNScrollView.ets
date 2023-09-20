import { Descriptor, RNOHContext, Tag } from '../../RNOH'
import { RNScrollViewManager } from '../componentManagers/RNScrollViewManager'
import { ViewBaseProps, RNViewBase } from './RNViewBase'
import { RNPullToRefreshView, RN_PULL_TO_REFRESH_VIEW_NAME } from './RNPullToRefreshView'

export type ScrollViewProps = ViewBaseProps & {
  scrollEnabled?: boolean
  contentOffsetX: number
  contentOffsetY: number
  flexDirection: number
  bounces: boolean
  persistentScrollbar: boolean
  showsHorizontalScrollIndicator: boolean
  showsVerticalScrollIndicator: boolean
  indicatorStyle?: IndicatorStyle
}

export type ScrollViewState = {
  contentOffsetX: number
  contentOffsetY: number
  contentSizeWidth: number
  contentSizeHeight: number
}

type Size = {
  width: number
  height: number
}

enum IndicatorStyle {
  Default = 0, 
  Black = 1,
  White = 2,
}

export type ScrollViewDescriptor = Descriptor<"ScrollView", ScrollViewProps, ScrollViewState>

@Component
export struct RNScrollView {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderDescriptors: () => void
  @State props: ScrollViewProps = {} as ScrollViewProps
  @State contentSize: Size = {} as Size
  @State childrenTags: Tag[] = []
  state: ScrollViewState = {} as ScrollViewState
  private scroller = new Scroller()
  private cleanupCommandCallback?: () => void = undefined
  private unregisterDescriptorChangesListener?: () => void = undefined
  private unregisterComponentManager?: () => void = undefined
  private scrollState: ScrollState = ScrollState.Idle

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag)
    this.onDescriptorUpdate(descriptor)
    this.state = descriptor.state
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      this.onDescriptorUpdate.bind(this)
    )
    this.cleanupCommandCallback = this.ctx.commandDispatcher.registerCommandCallback(
      this.tag,
      (command, args) => {
        if (command === 'scrollTo') {
          this.scrollTo(args[0], args[1], args[2]);
        }
      });
    this.unregisterComponentManager = this.ctx.rnInstanceManager.componentManagerRegistry
      .registerComponentManager(this.tag, new RNScrollViewManager(this.scroller))
  }

  onDescriptorUpdate(newDescriptor: ScrollViewDescriptor) {
    const oldProps = this.props
    this.props = newDescriptor.props
    const {contentSizeHeight, contentSizeWidth} = newDescriptor.state
    this.contentSize = {
      width: contentSizeWidth,
      height: contentSizeHeight
    }
    this.childrenTags = newDescriptor.childrenTags

    const {contentOffsetX, contentOffsetY} = newDescriptor.props
    if (contentOffsetX !== oldProps.contentOffsetX || contentOffsetY !== oldProps.contentOffsetY) {
      this.scrollToContentOffset();
    }
  }

  scrollToContentOffset() {
    const xOffset = this.props.contentOffsetX;
    const yOffset = this.props.contentOffsetY;
    this.scroller.scrollTo({ xOffset, yOffset });
  }

  aboutToDisappear() {
    this.cleanupCommandCallback?.();
    this.unregisterDescriptorChangesListener?.()
    this.unregisterComponentManager?.();
  }

  scrollTo(xOffset, yOffset, animated) {
    const animation = animated ? { duration: 1000, curve: Curve.Smooth } : undefined;
    this.scroller.scrollTo({ xOffset, yOffset, animation })
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.tag,
      "onScroll",
      this.createScrollEvent()
    )
  }

  scrollDirection(): ScrollDirection {
    if (!this.props.scrollEnabled) {
      return ScrollDirection.None
    } else if (this.props.flexDirection === 2) {
      return ScrollDirection.Horizontal
    } else {
      return ScrollDirection.Vertical
    }
  }

  scrollBarState(): BarState {
    if (((this.props.flexDirection === 2) && !this.props.showsHorizontalScrollIndicator)
      || ((this.props.flexDirection !== 2) && !this.props.showsVerticalScrollIndicator)) {
      return BarState.Off
    }
    return this.props.persistentScrollbar ? BarState.On : BarState.Auto
  }

  scrollBarColor() {
    if (this.props.indicatorStyle === IndicatorStyle.White) {
      return Color.White;
    }
    return Color.Black;
  }

  createScrollEvent() {
    const { xOffset, yOffset } = this.scroller.currentOffset();

    return {
      contentSize: {
        width: this.contentSize.width,
        height: this.contentSize.height,
      },
      contentOffset: {
        x: xOffset,
        y: yOffset,
      },
      containerSize: {
        width: this.props.width,
        height: this.props.height,
      },
      zoomScale: 1,
    }
  }

  onScroll(offset: number, scrollState: ScrollState) {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag);

    if (!descriptor) {
      // the view was unmounted while scrolling - don't report the event in that case
      return;
    }

    const currentOffset = this.scroller.currentOffset()
    const yOffset = currentOffset.yOffset;
    const xOffset = currentOffset.xOffset;

    const currentScrollState = this.scrollState;

    if (currentScrollState != scrollState) {
      if (currentScrollState === ScrollState.Scroll) {
        this.handleDragEnd();
      } else if (currentScrollState === ScrollState.Fling) {
        this.onMomentumEnd();
      }

      if (scrollState === ScrollState.Scroll) {
        this.onDragBegin();
      } else if (scrollState === ScrollState.Fling) {
        this.onMomentumBegin();
      }
    }
    this.scrollState = scrollState

    descriptor.state.contentOffsetX = xOffset;
    descriptor.state.contentOffsetY = yOffset;

    this.ctx.rnInstanceManager.emitComponentEvent(
      this.tag,
      "onScroll",
      this.createScrollEvent()
    )
  }

  onDragBegin() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.tag,
      "onScrollBeginDrag",
      this.createScrollEvent()
    )
  }

  handleDragEnd() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.tag,
      "onScrollEndDrag",
      this.createScrollEvent()
    )
  }

  onMomentumBegin() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.tag,
      "onMomentumScrollBegin",
      this.createScrollEvent()
    )
  }

  onMomentumEnd() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.tag,
      "onMomentumScrollEnd",
      this.createScrollEvent()
    )
  }

  onScrollEnd() {
    if (this.scrollState === ScrollState.Fling) {
      this.onMomentumEnd();
    } else if (this.scrollState === ScrollState.Scroll) {
      this.handleDragEnd();
    }
    this.scrollState = ScrollState.Idle;

    const { xOffset, yOffset } = this.scroller.currentOffset();
    this.state.contentOffsetX = xOffset;
    this.state.contentOffsetY = yOffset;
    this.ctx.descriptorRegistry.setState<ScrollViewState>(this.tag, this.state);
  }

  private shouldWrapWithPullToRefresh() {
    const pullToRefreshTag = this.maybeGetPullToRefreshTag()
    if (pullToRefreshTag === undefined) {
      return false
    }
    const childDescriptor = this.ctx.descriptorRegistry.getDescriptor(pullToRefreshTag)
    if (childDescriptor.type !== RN_PULL_TO_REFRESH_VIEW_NAME) {
      throw new Error(`The second child of native scroll component must be ${RN_PULL_TO_REFRESH_VIEW_NAME}`)
    }
    return true
  }

  private maybeGetPullToRefreshTag(): Tag | undefined {
    if (this.childrenTags.length === 2) {
      return this.childrenTags[1]
    }
    return undefined
  }

  @Builder
  buildScrollCore() {
    Scroll(this.scroller) {
      Stack() {
        this.renderDescriptors()
      }
      .width(this.contentSize.width)
      .height(this.contentSize.height)
      .backgroundColor(Color.Transparent)
      .margin({ top: -this.props.borderWidth.top, left: -this.props.borderWidth.left })
    }
    .width("100%")
    .height("100%")
    .align(Alignment.TopStart)
    .scrollable(this.scrollDirection())
    .scrollBar(this.scrollBarState())
    .scrollBarColor(this.scrollBarColor())
    // .scrollBarWidth(30)
    // .edgeEffect(this.props.bounces ? EdgeEffect.Spring : EdgeEffect.None)
    .onScrollFrameBegin(this.onScroll.bind(this))
    .onScrollStop(this.onScrollEnd.bind(this))
    .onAppear(this.scrollToContentOffset.bind(this))
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      if (this.shouldWrapWithPullToRefresh()) {
        RNPullToRefreshView({ ctx: this.ctx, tag: this.childrenTags[1] }) {
          this.buildScrollCore()
        }
      } else {
        this.buildScrollCore()
      }
    }
  }
}