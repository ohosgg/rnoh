import { Descriptor, RNOHContext, Size, Tag } from '../../RNOH';
import { _RNScrollViewManager } from '../componentManagers/RNScrollViewManager';
import { RNViewBase, ViewBaseProps } from './RNViewBase';
import { RN_PULL_TO_REFRESH_VIEW_NAME, RNPullToRefreshView } from './RNPullToRefreshView';
import { CustomComponentBuilder, RNComponentFactory } from './RNComponentFactory';

export interface ScrollViewProps extends ViewBaseProps {
  scrollEnabled?: boolean
  contentOffsetX: number
  contentOffsetY: number
  flexDirection: number
  bounces: boolean
  persistentScrollbar: boolean
  showsHorizontalScrollIndicator: boolean
  showsVerticalScrollIndicator: boolean
  indicatorStyle?: IndicatorStyle
  decelerationRate?: number
  scrollEventThrottle?: number
}

export interface ScrollViewRawProps {
  snapToInterval?: number
  snapToOffsets?: number[]
}

export interface ScrollViewState {
  contentOffsetX: number
  contentOffsetY: number
  contentSizeWidth: number
  contentSizeHeight: number
}

enum IndicatorStyle {
  Default = 0,
  Black = 1,
  White = 2,
}

export type ScrollViewDescriptor = Descriptor<"ScrollView", ScrollViewProps, ScrollViewState, ScrollViewRawProps>

@Component
export struct RNScrollView {
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  @State props: ScrollViewProps = {} as ScrollViewProps
  @State contentSize: Size = {} as Size
  @State childrenTags: Tag[] = []
  @State descriptor: ScrollViewDescriptor = Object() as ScrollViewDescriptor
  @State shouldPreventScrolling: boolean = false
  state: ScrollViewState = {} as ScrollViewState
  private parentTag: Tag | undefined = undefined
  private scroller = new Scroller()
  private cleanUpCallbacks: (() => void)[] = []
  private scrollState: ScrollState = ScrollState.Idle
  private componentManager!: _RNScrollViewManager
  private lastScrollDispatchTime: number = 0
  private allowNextScrollEvent: boolean = false

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag)
    this.onDescriptorUpdate(descriptor)
    this.state = descriptor.state
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (descriptor: ScrollViewDescriptor) => this.onDescriptorUpdate(descriptor)
    ))
    this.cleanUpCallbacks.push(this.ctx.commandDispatcher.registerCommandCallback(
      this.tag,
      (command, args) => {
        if (command === 'scrollTo') {
          this.scrollTo(args[0], args[1], args[2]);
        }
      }));
    this.componentManager = new _RNScrollViewManager(this.tag, this.ctx, this.scroller)
    this.cleanUpCallbacks.push(this.ctx.componentManagerRegistry.registerComponentManager(this.tag, this.componentManager));
    this.cleanUpCallbacks.push(this.componentManager.subscribe("LOCK_SCROLLING", () => {
      this.shouldPreventScrolling = true
    }))
    this.cleanUpCallbacks.push(this.componentManager.subscribe("UNLOCK_SCROLLING", () => {
      this.shouldPreventScrolling = false
    }))
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cleanUp => cleanUp())
  }

  onDescriptorUpdate(newDescriptor: ScrollViewDescriptor) {
    const oldProps = this.props
    this.props = newDescriptor.props
    this.descriptor = newDescriptor
    this.contentSize = {
      width: newDescriptor.state.contentSizeWidth,
      height: newDescriptor.state.contentSizeHeight
    }
    this.childrenTags = newDescriptor.childrenTags
    this.parentTag = newDescriptor.parentTag
    if (newDescriptor.props.contentOffsetX !== oldProps.contentOffsetX || newDescriptor.props.contentOffsetY !== oldProps.contentOffsetY) {
      this.scrollToContentOffset();
    }
  }

  scrollToContentOffset() {
    const xOffset = this.props.contentOffsetX;
    const yOffset = this.props.contentOffsetY;
    this.scroller.scrollTo({ xOffset, yOffset });
  }

  scrollTo(xOffset, yOffset, animated) {
    const animation = animated ? { duration: 1000, curve: Curve.Smooth } : undefined;
    this.scroller.scrollTo({ xOffset, yOffset, animation })
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      "onScroll",
      this.createScrollEvent()
    )
  }

  scrollDirection(): ScrollDirection {
    if (this.shouldPreventScrolling) return ScrollDirection.None
    return this.props.flexDirection === 2 ? ScrollDirection.Horizontal : ScrollDirection.Vertical;
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

  getFriction() {
    // default deceleration rate and friction values differ between ArkUI and RN
    // so we adapt the decelerationRate accordingly to resemble iOS behaviour
    // iOS's UIScrollView supports only two values of decelerationRate
    // called 'normal' and 'fast' and maps all other to the nearest of those two
    const IOS_NORMAL = 0.998;
    const IOS_FAST = 0.99;
    const ARKUI_FAST = 2;
    const ARKUI_NORMAL = 0.6;
    if (this.props.decelerationRate < (IOS_NORMAL + IOS_FAST) / 2) {
      return ARKUI_FAST;
    }
    else {
      return ARKUI_NORMAL;
    }
  }

  getScrollSnap(): ScrollSnapOptions {
    // ScrollSnap API changed between SDKs causing compile errors
    // and newer SDK requires updating OS on the devices.
    // We temporarily disable this feature until we completely move to the newer SDK.

    // if (this.descriptor.rawProps.snapToOffsets && this.descriptor.rawProps.snapToOffsets.length > 0) {
    //   return {
    //     snapAlign: ScrollSnapAlign.CENTER,
    //     snapPagination: this.descriptor.rawProps.snapToOffsets
    //   }
    // }
    // if (this.descriptor.rawProps.snapToInterval > 0) {
    //   return {
    //     snapAlign: ScrollSnapAlign.CENTER,
    //     snapPagination: this.descriptor.rawProps.snapToInterval
    //   }
    // }

    return undefined
  }

  createScrollEvent() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag);

    if (!descriptor) {
      // the view was unmounted while scrolling - don't report the event in that case
      return;
    }

    return {
      contentSize: {
        width: this.contentSize.width,
        height: this.contentSize.height,
      },
      contentOffset: {
        x: descriptor.state.contentOffsetX,
        y: descriptor.state.contentOffsetY,
      },
      containerSize: {
        width: this.descriptor.layoutMetrics.frame.size.width,
        height: this.descriptor.layoutMetrics.frame.size.height,
      },
      zoomScale: 1,
    }
  }

  onScroll(_: number, scrollState: ScrollState) {
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
  }

  onScrollEvent(dx?: number, dy?: number) {
    const currentOffset = this.scroller.currentOffset();
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag);

    if (!descriptor) {
      // the view was unmounted while scrolling - don't report the event in that case
      return;
    }
    descriptor.state.contentOffsetX = currentOffset.xOffset;
    descriptor.state.contentOffsetY = currentOffset.yOffset;

    const now = Date.now();
    if (this.allowNextScrollEvent || descriptor.props.scrollEventThrottle < now - this.lastScrollDispatchTime) {
      this.lastScrollDispatchTime = now
      this.ctx.rnInstance.emitComponentEvent(
        this.tag,
        "onScroll",
        this.createScrollEvent()
      )
    }
  }

  onDragBegin() {
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      "onScrollBeginDrag",
      this.createScrollEvent()
    )
  }

  handleDragEnd() {
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      "onScrollEndDrag",
      this.createScrollEvent()
    )
  }

  onMomentumBegin() {
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      "onMomentumScrollBegin",
      this.createScrollEvent()
    )
  }

  onMomentumEnd() {
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      "onMomentumScrollEnd",
      this.createScrollEvent()
    )
  }

  onScrollBegin() {
    this.componentManager.setScrolling(true);
    this.allowNextScrollEvent = false;
  }

  onScrollEnd() {
    this.componentManager.setScrolling(false);

    // fire an additional event after the scrolling has ended
    // ignoring throttle
    this.allowNextScrollEvent = true;
    this.onScrollEvent();

    if (this.scrollState === ScrollState.Fling) {
      this.onMomentumEnd();
    } else if (this.scrollState === ScrollState.Scroll) {
      this.handleDragEnd();
    }
    this.scrollState = ScrollState.Idle;

    const currentOffset = this.scroller.currentOffset();
    this.state.contentOffsetX = currentOffset.xOffset;
    this.state.contentOffsetY = currentOffset.yOffset;
    this.ctx.descriptorRegistry.setState<ScrollViewState>(this.tag, this.state);
  }

  private shouldWrapWithPullToRefresh() {
    const pullToRefreshTag = this.parentTag
    if (pullToRefreshTag === undefined) {
      return false
    }
    const parentDescriptor = this.ctx.descriptorRegistry.getDescriptor<Descriptor>(pullToRefreshTag)
    if (parentDescriptor.type !== RN_PULL_TO_REFRESH_VIEW_NAME) {
      return false
    }
    return true
  }

  @Builder
  buildScrollCore() {
    Scroll(this.scroller) {
      Stack() {
        ForEach(this.descriptor.childrenTags, (childrenTag: Tag) => {
          RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
        }, (childrenTag: Tag) => childrenTag.toString())
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
    .enableScrollInteraction(this.props.scrollEnabled)
    .edgeEffect(this.props.bounces ? EdgeEffect.Spring : EdgeEffect.None)
    .onScrollFrameBegin((offset, state) => {
      this.onScroll(offset, state)
      return { offsetRemain: offset }
    })
    .onScroll((xOffset, yOffset) => {
      this.onScrollEvent(xOffset, yOffset)
    })
    .onScrollStart(() => {
      this.onScrollBegin()
    })
    .onScrollStop(() => {
      this.onScrollEnd()
    })
    .onAppear(() => {
      this.scrollToContentOffset()
    })
    .friction(this.getFriction())
    .scrollSnap(this.getScrollSnap())
  }

  build() {
    if (this.shouldWrapWithPullToRefresh()) {
      RNViewBase({ ctx: this.ctx, tag: this.parentTag }) {
        RNPullToRefreshView({ ctx: this.ctx, tag: this.parentTag }) {
          this.buildScrollCore()
        }
      }
    } else {
      RNViewBase({ ctx: this.ctx, tag: this.tag, componentManager: this.componentManager }) {
        this.buildScrollCore()
      }
    }
  }
}