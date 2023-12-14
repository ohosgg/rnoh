import type { Point, RNOHContext, Tag } from '../../../RNOH/ts';
import { EventEmitter } from '../../../RNOH/ts';
import { RNViewManager } from '../../componentManagers'

export type RNScrollLocalEventArgsByName = {
  "LOCK_SCROLLING": [],
  "UNLOCK_SCROLLING": []
}

export class RNScrollViewManager extends RNViewManager {
  protected isScrolling: boolean = false;
  protected eventEmitter = new EventEmitter<RNScrollLocalEventArgsByName>()
  protected scrollLockCount = 0

  constructor(
    tag: Tag,
    ctx: RNOHContext,
    protected scroller: any
  ) {
    super(tag, ctx);
  }

  public computeChildPoint({x, y}: Point, childTag: Tag): Point {
    const {xOffset, yOffset} = this.scroller.currentOffset();
    return super.computeChildPoint({ x: x + xOffset, y: y + yOffset }, childTag);
  }

  public getScroller() {
    return this.scroller;
  }

  public isHandlingTouches() {
    return this.isScrolling;
  }

  /**
   * @deprecated
   */
  public lockScrolling(): () => void {
    this.scrollLockCount++
    this.eventEmitter.emit("LOCK_SCROLLING")
    return () => {
      this.scrollLockCount--
      if (this.scrollLockCount === 0)
        return this.eventEmitter.emit("UNLOCK_SCROLLING")
    }
  }
}

export class _RNScrollViewManager extends RNScrollViewManager {
  public setScrolling(value: boolean) {
    this.isScrolling = value;
  }

  public subscribe<TEventType extends keyof RNScrollLocalEventArgsByName>(
    eventType: TEventType,
    listener: (...args: RNScrollLocalEventArgsByName[TEventType]) => void,
  ): () => void {
    return this.eventEmitter.subscribe(eventType, listener)
  }
}