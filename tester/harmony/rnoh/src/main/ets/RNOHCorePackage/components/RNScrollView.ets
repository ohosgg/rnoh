import { Descriptor, RNOHContext } from '../../RNOH'
import { ViewBaseProps, RNViewBase } from './RNViewBase'
import { RNOHEventEmitRequestHandlerName } from "./../RNOHEventEmitRequestHandler"

export type ScrollViewProps = ViewBaseProps & {
  scrollEnabled?: boolean
  contentOffsetX: number
  contentOffsetY: number
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

    setTimeout(() => this.scroller.scrollTo({ xOffset, yOffset, animation }), 0);
  }

  scrollDirection(): ScrollDirection {
    // TODO: support horizontal and free Scroll - one solution is to always nest two Scroll components, one vertical, one horizontal
    if (!this.descriptor.props.scrollEnabled) {
      return ScrollDirection.None
    }

    return ScrollDirection.Vertical
  }

  createScrollEvent(type: string, xOffset: number, yOffset: number) {
    return {
      type,
      contentOffsetX: xOffset,
      contentOffsetY: yOffset,
      contentWidth: this.descriptor.state.contentSizeWidth,
      contentHeight: this.descriptor.state.contentSizeHeight,
      containerWidth: this.descriptor.props.width,
      containerHeight: this.descriptor.props.height,
    }
  }

  onScroll(offset: number, scrollState: ScrollState) {
    const currentOffset = this.scroller.currentOffset()
    const yOffset = currentOffset.yOffset + offset;

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

    // TODO: check if scroll is horizontal/vertical and adjust the correct offset
    // this.descriptor.state.contentOffsetX = offset.xOffset;
    this.ctx.descriptorRegistry.getDescriptor<ScrollViewDescriptor>(this.tag).state.contentOffsetY = yOffset;

    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      RNOHEventEmitRequestHandlerName.Scroll,
      this.createScrollEvent("scroll", 0, yOffset)
    )
  }

  onDragBegin() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      RNOHEventEmitRequestHandlerName.Scroll,
      this.createScrollEvent(
        "beginDrag",
        this.descriptor.state.contentOffsetX,
        this.descriptor.state.contentOffsetY
      )
    )
  }

  onDragEnd() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      RNOHEventEmitRequestHandlerName.Scroll,
      this.createScrollEvent(
        "endDrag",
        this.descriptor.state.contentOffsetX,
        this.descriptor.state.contentOffsetY
      )
    )
  }

  onMomentumBegin() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      RNOHEventEmitRequestHandlerName.Scroll,
      this.createScrollEvent(
        "beginMomentum",
        this.descriptor.state.contentOffsetX,
        this.descriptor.state.contentOffsetY
      )
    )
  }

  onMomentumEnd() {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      RNOHEventEmitRequestHandlerName.Scroll,
      this.createScrollEvent(
        "endMomentum",
        this.descriptor.state.contentOffsetX,
        this.descriptor.state.contentOffsetY
      )
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
      //    .scrollBar(BarState.On)
      //    .scrollBarColor(Color.Gray)
      //    .scrollBarWidth(30)
      //    .edgeEffect(this.descriptor.props.bounces ? EdgeEffect.Spring : EdgeEffect.None)
      .onScrollFrameBegin(this.onScroll.bind(this))
      .onScrollStop(this.onScrollEnd.bind(this))
    }
  }
}