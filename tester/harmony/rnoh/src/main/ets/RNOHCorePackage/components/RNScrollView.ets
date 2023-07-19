import { Descriptor, RNOHContext } from '../../RNOH'
import { ViewBaseProps, RNViewBase } from './RNViewBase'

export type ScrollViewProps = ViewBaseProps & {
  scrollEnabled?: boolean
  contentOffsetX: number
  contentOffsetY: number
  flexDirection: number
  bounces: boolean
}

export type ScrollViewState = {
  contentOffsetX: number
  contentOffsetY: number
  contentSizeWidth: number
  contentSizeHeight: number
}

export type ScrollViewDescriptor = Descriptor<"ScrollView", ScrollViewProps, ScrollViewState>

@Component
export struct RNScrollView {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderDescriptors: () => void
  @State descriptor: ScrollViewDescriptor = {} as ScrollViewDescriptor
  private scroller = new Scroller()
  private cleanupCommandCallback?: () => void = undefined
  private unregisterDescriptorChangesListener?: () => void = undefined
  private scrollState: ScrollState = ScrollState.Idle

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as ScrollViewDescriptor)
      }
    )
    this.cleanupCommandCallback = this.ctx.commandDispatcher.registerCommandCallback(
      this.tag,
      (command, args) => {
        if (command === 'scrollTo') {
          this.scrollTo(args[0], args[1], args[2]);
        }
      });
  }

  aboutToDisappear() {
    this.cleanupCommandCallback?.();
    this.unregisterDescriptorChangesListener?.()
  }

  scrollTo(xOffset, yOffset, animated) {
    const animation = animated ? { duration: 1000, curve: Curve.Smooth } : undefined;
    this.scroller.scrollTo({ xOffset, yOffset, animation })
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      "onScroll",
      this.createScrollEvent()
    )
  }

  scrollDirection(): ScrollDirection {
    if (!this.descriptor.props.scrollEnabled) {
      return ScrollDirection.None
    } else if (this.descriptor.props.flexDirection === 2) {
      return ScrollDirection.Horizontal
    } else {
      return ScrollDirection.Vertical
    }
  }

  createScrollEvent() {
    const { xOffset, yOffset } = this.scroller.currentOffset();

    return {
      contentSize: {
        width: this.descriptor.state.contentSizeWidth,
        height: this.descriptor.state.contentSizeHeight,
      },
      contentOffset: {
        x: xOffset,
        y: yOffset,
      },
      containerSize: {
        width: this.descriptor.props.width,
        height: this.descriptor.props.height,
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
        this.onDragEnd();
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
      this.descriptor.tag,
      "onScroll",
      this.createScrollEvent()
    )
  }

  onDragBegin() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      "onScrollBeginDrag",
      this.createScrollEvent()
    )
  }

  onDragEnd() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      "onScrollEndDrag",
      this.createScrollEvent()
    )
  }

  onMomentumBegin() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      "onMomentumScrollBegin",
      this.createScrollEvent()
    )
  }

  onMomentumEnd() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      "onMomentumScrollEnd",
      this.createScrollEvent()
    )
  }

  onScrollEnd() {
    if (this.scrollState === ScrollState.Fling) {
      this.onMomentumEnd();
    } else if (this.scrollState === ScrollState.Scroll) {
      this.onDragEnd();
    }
    this.scrollState = ScrollState.Idle;

    const { xOffset, yOffset } = this.scroller.currentOffset();
    this.descriptor.state.contentOffsetX = xOffset;
    this.descriptor.state.contentOffsetY = yOffset;
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Scroll(this.scroller) {
        Stack() {
          this.renderDescriptors()
        }
        .width(this.descriptor.state.contentSizeWidth)
        .height(this.descriptor.state.contentSizeHeight)
        .backgroundColor(Color.Transparent)
      }
      .width("100%")
      .height("100%")
      .align(Alignment.TopStart)
      .scrollable(this.scrollDirection())
      .scrollBar(BarState.Off)
      //    .scrollBarColor(Color.Gray)
      //    .scrollBarWidth(30)
      //    .edgeEffect(this.descriptor.props.bounces ? EdgeEffect.Spring : EdgeEffect.None)
      .onScrollFrameBegin(this.onScroll.bind(this))
      .onScrollStop(this.onScrollEnd.bind(this))
    }
  }
}