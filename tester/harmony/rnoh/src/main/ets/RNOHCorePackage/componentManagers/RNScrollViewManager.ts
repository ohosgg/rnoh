import { Tag } from '../../RNOH/DescriptorBase';
import { Point, RNOHContext, RNViewManager } from '../../RNOH';

export class RNScrollViewManager extends RNViewManager {

  constructor(
    tag: Tag,
    ctx: RNOHContext,
    private scroller: any
  ) {
    super(tag, ctx);
  }

  private isScrolling: boolean = false;

  public getRelativePoint({x, y}: Point, childTag: Tag): Point {
    const {xOffset, yOffset} = this.scroller.currentOffset();
    return super.getRelativePoint({x: x+xOffset, y: y+yOffset}, childTag);
  }

  public getScroller() {
    return this.scroller;
  }

  public setScrolling(value: boolean) {
    this.isScrolling = value;
  }

  public isHandlingTouches() {
    return this.isScrolling;
  }
}