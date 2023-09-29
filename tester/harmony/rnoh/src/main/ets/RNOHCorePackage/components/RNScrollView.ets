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
  decelerationRate?: number
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
  @State descriptor: ScrollViewDescriptor = {} as ScrollViewDescriptor
  state: ScrollViewState = {} as ScrollViewState
  private parentTag: Tag | undefined = undefined
  private scroller = new Scroller()
  private cleanupCommandCallback?: () => void = undefined
  private unregisterDescriptorChangesListener?: () => void = undefined
  private unregisterComponentManager?: () => void = undefined
  private scrollState: ScrollState = ScrollState.Idle
  private componentManager: RNScrollViewManager = undefined

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
    this.componentManager = new RNScrollViewManager(this.tag, this.ctx, this.scroller)
    if (this.shouldWrapWithPullToRefresh()) {
      this.unregisterComponentManager = this.ctx.componentManagerRegistry.registerComponentManager(this.tag, this.componentManager);
    }
  }

  onDescriptorUpdate(newDescriptor: ScrollViewDescriptor) {
    const oldProps = this.props
    this.props = newDescriptor.props
    this.descriptor = newDescriptor
    const {contentSizeHeight, contentSizeWidth} = newDescriptor.state
    this.contentSize = {
      width: contentSizeWidth,
      height: contentSizeHeight
    }
    this.childrenTags = newDescriptor.childrenTags
    this.parentTag = newDescriptor.parentTag
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

  friction() {
    // default deceleration rate and friction values differ between ArkUI and RN
    // so we need to adapt the decelerationRate got in props to resemble the behaviour
    // on other platforms
    const IOS_DEFAULT_DEC_RATE = 0.998;
    const ARKUI_DEFAULT_FRICTION = 0.9;
    let friction = 100;
    if (this.props.decelerationRate > 0 && this.props.decelerationRate < 1) {
      friction = (1 - this.props.decelerationRate) * ARKUI_DEFAULT_FRICTION / (1 - IOS_DEFAULT_DEC_RATE);
    }
    return friction
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

  onScrollEvent(dx: number, dy: number) {
    const {xOffset, yOffset} = this.scroller.currentOffset();
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag);

    if (!descriptor) {
      // the view was unmounted while scrolling - don't report the event in that case
      return;
    }
    descriptor.state.contentOffsetX = xOffset;
    descriptor.state.contentOffsetY = yOffset;

    this.ctx.rnInstance.emitComponentEvent(
      this.tag,
      "onScroll",
      this.createScrollEvent()
    )
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
  }

  onScrollEnd() {
    this.componentManager.setScrolling(false);
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
    const pullToRefreshTag = this.parentTag
    if (pullToRefreshTag === undefined) {
      return false
    }
    const parentDescriptor = this.ctx.descriptorRegistry.getDescriptor(pullToRefreshTag)
    if (parentDescriptor.type !== RN_PULL_TO_REFRESH_VIEW_NAME) {
      return false
    }
    return true
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
    .enableScrollInteraction(this.props.scrollEnabled)
    .edgeEffect(this.props.bounces ? EdgeEffect.Spring : EdgeEffect.None)
    .onScrollFrameBegin(this.onScroll.bind(this))
    .onScroll(this.onScrollEvent.bind(this))
    .onScrollStart(this.onScrollBegin.bind(this))
    .onScrollStop(this.onScrollEnd.bind(this))
    .onAppear(this.scrollToContentOffset.bind(this))
    .friction(this.friction())
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