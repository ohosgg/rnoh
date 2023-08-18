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

type Size = {
  width: number
  height: number
}

export type ScrollViewDescriptor = Descriptor<"ScrollView", ScrollViewProps, ScrollViewState>

@Component
export struct RNScrollView {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderDescriptors: () => void
  @State props: ScrollViewProps = {} as ScrollViewProps
  @State contentSize: Size = {} as Size
  state: ScrollViewState = {} as ScrollViewState
  private scroller = new Scroller()
  private cleanupCommandCallback?: () => void = undefined
  private unregisterDescriptorChangesListener?: () => void = undefined
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
  }

  onDescriptorUpdate(newDescriptor: ScrollViewDescriptor) {
    this.props = newDescriptor.props
    const {contentSizeHeight, contentSizeWidth} = newDescriptor.state
    this.contentSize = {
      width: contentSizeWidth,
      height: contentSizeHeight
    }
  }

  aboutToDisappear() {
    this.cleanupCommandCallback?.();
    this.unregisterDescriptorChangesListener?.()
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

  onDragEnd() {
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
      this.onDragEnd();
    }
    this.scrollState = ScrollState.Idle;

    const { xOffset, yOffset } = this.scroller.currentOffset();
    this.state.contentOffsetX = xOffset;
    this.state.contentOffsetY = yOffset;
    this.ctx.descriptorRegistry.setState<ScrollViewState>(this.tag, this.state);
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Scroll(this.scroller) {
        Stack() {
          this.renderDescriptors()
        }
        .width(this.contentSize.width)
        .height(this.contentSize.height)
        .backgroundColor(Color.Transparent)
        .margin({ top: -this.props.borderWidth, left: -this.props.borderWidth })
      }
      .width("100%")
      .height("100%")
      .align(Alignment.TopStart)
      .scrollable(this.scrollDirection())
      .scrollBar(BarState.Off)
      //    .scrollBarColor(Color.Gray)
      //    .scrollBarWidth(30)
      //    .edgeEffect(this.props.bounces ? EdgeEffect.Spring : EdgeEffect.None)
      .onScrollFrameBegin(this.onScroll.bind(this))
      .onScrollStop(this.onScrollEnd.bind(this))
    }
  }
}