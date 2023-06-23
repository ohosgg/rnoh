import { Descriptor } from '../../RNOH/DescriptorBase'
import { ViewProps, RNViewBase } from './RNView'
import { RNOHContext } from "../../RNOH/RNOHContext"
import { RNOHEventEmitRequestHandlerName } from "./.."

export type ScrollViewProps = ViewProps & {
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
      containerHeight: this.descriptor.props.width,
    }
  }

  onScroll(xOffset: number, yOffset: number) {
    const offset = this.scroller.currentOffset()

    this.descriptor.state.contentOffsetX = offset.xOffset;
    this.descriptor.state.contentOffsetY = offset.yOffset;

    this.ctx.rnInstance.emitComponentEvent(
      this.descriptor.tag,
      RNOHEventEmitRequestHandlerName.Scroll,
      this.createScrollEvent("scroll", offset.xOffset, offset.yOffset)
    )
  }

  onScrollBegin(dx: number, dy: number) {
    this.ctx.rnInstance.emitComponentEvent(
      this.descriptor.tag,
      RNOHEventEmitRequestHandlerName.Scroll,
      this.createScrollEvent(
        "begin",
        this.descriptor.state.contentOffsetX,
        this.descriptor.state.contentOffsetY
      )
    )
    return { dxRemain: dx, dyRemain: dy }
  }

  onScrollEnd() {
    this.ctx.rnInstance.emitComponentEvent(
      this.descriptor.tag,
      "Scroll",
      this.createScrollEvent(
        "end",
        this.descriptor.state.contentOffsetX,
        this.descriptor.state.contentOffsetY
      )
    )
  }

  build() {
    RNViewBase({ctx: this.ctx, tag: this.tag}) {
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
      .onScroll(this.onScroll.bind(this))
      //    .onScrollBegin(this.onScrollBegin.bind(this))
      //    .onScrollEnd(this.onScrollEnd.bind(this))
    }
  }
}