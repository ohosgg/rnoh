import { Descriptor, RNOHContext, Size, Tag, Position } from '../../RNOH';
import { _RNScrollViewManager } from '../componentManagers/RNScrollViewManager';
import { RNViewBase, ViewBaseProps, ViewDescriptorWrapperBase, ViewRawProps } from './RNViewBase';
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
  decelerationRate: number
  scrollEventThrottle: number
}

export interface ScrollViewRawProps extends ViewRawProps {
  snapToInterval?: number
  snapToOffsets?: number[]
}

export interface ScrollViewState {
  contentOffsetX: number
  contentOffsetY: number
  contentSizeWidth: number
  contentSizeHeight: number
}

class ScrollViewDescriptorWrapper extends ViewDescriptorWrapperBase<"ScrollView", ScrollViewProps, ScrollViewState, ScrollViewRawProps> {
}

enum IndicatorStyle {
  Default = 0,
  Black = 1,
  White = 2,
}

interface CurrentOffset {
  xOffset: number,
  yOffset: number
}

interface Dimensions {
  width: number;
  height: number;
}

interface Coordinates {
  x: number;
  y: number;
}

interface ScrollEvent {
  contentSize: Dimensions;
  contentOffset: Coordinates;
  containerSize: Dimensions;
  zoomScale: number;
}

interface IAnimation {
  duration?: number;
  curve?: Curve | ICurve;
};
type Animation = IAnimation | boolean;

export type ScrollViewDescriptor = Descriptor<"ScrollView", ScrollViewProps, ScrollViewState, ScrollViewRawProps>;

@Component
export struct RNScrollView {
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  @State props: ScrollViewProps = {} as ScrollViewProps
  @State contentSize: Size = {} as Size
  @State childrenTags: Tag[] = []
  @State descriptor: ScrollViewDescriptor = Object() as ScrollViewDescriptor
  @State descriptorWrapper: ScrollViewDescriptorWrapper | undefined = undefined
  private parentTag: Tag | undefined = undefined
  private scroller = new Scroller()
  private cleanUpCallbacks: (() => void)[] = []
  private scrollState: ScrollState = ScrollState.Idle
  private componentManager!: _RNScrollViewManager
  private lastScrollDispatchTime: number = 0
  private allowNextScrollEvent: boolean = false
  private contentOffset: Position = { x: 0, y: 0 }
  @State shouldPreventScrolling: boolean = false

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag)
    this.onDescriptorUpdate(descriptor)
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (descriptor) => this.onDescriptorUpdate(descriptor as ScrollViewDescriptor)
    ))
    this.cleanUpCallbacks.push(this.ctx.componentCommandReceiver.registerCommandCallback(
      this.tag,
      (command, args: [number, number, number]) => {
        if (command === 'scrollTo') {
          this.scrollTo(args[0], args[1], args[2]);
        } else if (command === 'scrollToEnd') {
          this.scrollToEnd(args[0]);
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
    const prevState = this.descriptor.state
    const prevProps = this.props
    this.props = newDescriptor.props
    this.descriptor = newDescriptor
    this.descriptorWrapper = new ScrollViewDescriptorWrapper(newDescriptor)
    this.contentSize = {
      width: newDescriptor.state.contentSizeWidth,
      height: newDescriptor.state.contentSizeHeight
    }
    this.childrenTags = newDescriptor.childrenTags
    this.parentTag = newDescriptor.parentTag
    if (newDescriptor.props.contentOffsetX !== prevProps.contentOffsetX || newDescriptor.props.contentOffsetY !== prevProps.contentOffsetY) {
      this.scrollToPropsContentOffset();
    } else if (this.descriptor.state.contentSizeWidth !== prevState.contentSizeWidth || this.descriptor.state.contentSizeHeight !== prevState.contentSizeHeight) {
      /**
       * When a scroll content is removed, and it appears again without scrolling, scroll should remain in the original position.
       * This behavior was observed on Android. Local contentOffset is used, to use the most recent position.
       * The contentOffset in the descriptor's state might be delayed.
       */
      this.scroller.scrollTo({
        xOffset: this.contentOffset.x,
        yOffset: this.contentOffset.y
      });
    }
  }

  scrollToPropsContentOffset() {
    const xOffset = this.props.contentOffsetX;
    const yOffset = this.props.contentOffsetY;
    this.scroller.scrollTo({ xOffset, yOffset });
  }

  scrollTo(xOffset: number, yOffset: number, animated: number) {
    const animation: Animation | undefined = animated ? { duration: 1000, curve: Curve.Smooth } : undefined;
    this.scroller.scrollTo({ xOffset, yOffset, animation })
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      "onScroll",
      this.createScrollEvent()
    )
  }

  scrollToEnd(animated: number) {
    if (animated) {
      this.scroller.scrollEdge(Edge.End);
    }
    else {
      const xOffset = this.props.flexDirection === 2 ? this.contentSize.width - this.descriptor.layoutMetrics.frame.size.width : 0;
      const yOffset = this.props.flexDirection === 2 ? 0 : this.contentSize.height - this.descriptor.layoutMetrics.frame.size.height;
      this.scroller.scrollTo({ xOffset, yOffset, animation: false })
    }
    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      "onScroll",
      this.createScrollEvent()
    )
  }

  scrollDirection(): ScrollDirection {
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

  getScrollSnap(): ScrollSnapOptions | undefined {
    const snapToOffsets = this.descriptor.rawProps.snapToOffsets
    if (snapToOffsets && snapToOffsets.length > 0) {
      return {
        snapAlign: ScrollSnapAlign.CENTER,
        snapPagination: snapToOffsets
      }
    }
    const snapToInterval = this.descriptor.rawProps.snapToInterval
    if (snapToInterval && snapToInterval > 0) {
      return {
        snapAlign: ScrollSnapAlign.CENTER,
        snapPagination: snapToInterval
      }
    }
    return undefined
  }

  createScrollEvent(): ScrollEvent | undefined {
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

  onScrollEvent() {
    const currentOffset: CurrentOffset = this.scroller.currentOffset();
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
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag);
    if (!descriptor) {
      return;
    }

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

    const currentOffset: CurrentOffset = this.scroller.currentOffset();
    descriptor.state.contentOffsetX = currentOffset.xOffset;
    descriptor.state.contentOffsetY = currentOffset.yOffset;
    this.contentOffset = { x: currentOffset.xOffset, y: currentOffset.yOffset }
    this.ctx.descriptorRegistry.setState<ScrollViewState>(this.tag, descriptor.state);
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
      .margin({
        top: -Number(this.descriptorWrapper?.borderWidth.top ?? 0),
        left: -Number(this.descriptorWrapper?.borderWidth.left ?? 0)
      })
    }
    .width("100%")
    .height("100%")
    .align(Alignment.TopStart)
    .scrollable(this.scrollDirection())
    .scrollBar(this.scrollBarState())
    .scrollBarColor(this.scrollBarColor())
    .enableScrollInteraction(this.props.scrollEnabled && !this.shouldPreventScrolling)
    .nestedScroll({ scrollForward: NestedScrollMode.SELF_FIRST, scrollBackward: NestedScrollMode.SELF_FIRST })
    .edgeEffect(this.props.bounces ? EdgeEffect.Spring : EdgeEffect.None)
    .onScrollFrameBegin((offset, state) => {
      this.onScroll(offset, state)
      return { offsetRemain: offset }
    })
    .onScroll(() => {
      this.onScrollEvent()
    })
    .onScrollStart(() => {
      this.onScrollBegin()
    })
    .onScrollStop(() => {
      this.onScrollEnd()
    })
    .onAppear(() => {
      this.scrollToPropsContentOffset()
    })
    .friction(this.getFriction())
    .scrollSnap(this.getScrollSnap())
    .focusable(this.descriptor.rawProps.focusable ?? false)
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