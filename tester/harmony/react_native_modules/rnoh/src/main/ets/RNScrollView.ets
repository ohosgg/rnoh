import { ColorSegments, Descriptor, Tag } from './descriptor'
import { ViewProps } from './RNView'
import { convertColorSegmentsToString } from './cpp-bridge-utils'
import { ReactEventKind } from './events'
import { CommandDispatcher } from './CommandDispatcher'
import { RNInstance } from "./RNInstance"

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
  @Consume("RNInstance") rnInstance: RNInstance
  @State tag: number = -1
  @BuilderParam renderDescriptors: () => void
  @Prop descriptor: ScrollViewDescriptor
  @Consume('__RN_COMMAND_DISPATCHER') commandDispatcher: CommandDispatcher
  private scroller = new Scroller()
  private cleanupCommandCallback?: () => void = undefined

  aboutToAppear() {
    this.cleanupCommandCallback = this.commandDispatcher.registerCommandCallback(
    this.tag,
      (command, args) => {
        if (command === 'scrollTo') {
          this.scrollTo(args[0], args[1], args[2]);
        }
      });
  }

  aboutToDisappear() {
    this.cleanupCommandCallback?.();
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

    this.rnInstance.emitEvent(
    this.descriptor.tag,
    ReactEventKind.SCROLL,
    this.createScrollEvent("scroll", offset.xOffset, offset.yOffset)
    )
  }

  onScrollBegin(dx: number, dy: number) {
    this.rnInstance.emitEvent(
    this.descriptor.tag,
    ReactEventKind.SCROLL,
    this.createScrollEvent(
      "begin",
    this.descriptor.state.contentOffsetX,
    this.descriptor.state.contentOffsetY
    )
    )
    return { dxRemain: dx, dyRemain: dy }
  }

  onScrollEnd() {
    this.rnInstance.emitEvent(
    this.descriptor.tag,
    ReactEventKind.SCROLL,
    this.createScrollEvent(
      "end",
    this.descriptor.state.contentOffsetX,
    this.descriptor.state.contentOffsetY
    )
    )
  }

  build() {
    Scroll(this.scroller) {
      Stack() {
        this.renderDescriptors()
      }
      .width(this.descriptor.state.contentSizeWidth)
      .height(this.descriptor.state.contentSizeHeight)
      .backgroundColor(Color.Transparent)
    }
    .width(this.descriptor.props.width)
    .height(this.descriptor.props.height)
    .position({ y: this.descriptor.props.top, x: this.descriptor.props.left })
    .scrollable(this.scrollDirection())
    //    .scrollBar(BarState.On)
    //    .scrollBarColor(Color.Gray)
    //    .scrollBarWidth(30)
    .edgeEffect(this.descriptor.props.bounces ? EdgeEffect.Spring : EdgeEffect.None)
    .onScroll(this.onScroll.bind(this))
    //    .onScrollBegin(this.onScrollBegin.bind(this))
    //    .onScrollEnd(this.onScrollEnd.bind(this))
    .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
  }
}