import type { Point } from '../../RNOH/ts';
import { RNViewManager } from './RNViewManager'

export class RNSurfaceManager extends RNViewManager {
  public isPointInBoundingBox(point: Point): boolean {
    return this.isPointInView(point)
  }

  public updateBoundingBox(): void {
    return;
  }

  public isHandlingTouches() {
    return true;
  }
}