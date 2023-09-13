import { RNOHEventEmitRequestHandlerName } from '../RNOHCorePackage/RNOHEventEmitRequestHandler';
import { Tag } from './DescriptorBase';
import { RNInstance } from './RNInstance';
import { RNOHLogger } from './RNOHLogger';
import { TouchTarget, TouchTargetHelper } from './TouchTargetHelper';

export class TouchDispatcher {
  private touchTargetHelper: TouchTargetHelper
  private targetTagByTouchId: Map<number, Tag> = new Map();

  constructor(private surfaceTag: Tag, private rnInstance: RNInstance, private logger: RNOHLogger) {
    this.touchTargetHelper = new TouchTargetHelper(surfaceTag, rnInstance.descriptorRegistry, rnInstance.componentManagerRegistry, logger);
    this.convertTouchObject = this.convertTouchObject.bind(this);
  }

  public handleTouchEvent(touchEvent: TouchEvent) {
    const changedIds = touchEvent.changedTouches.map(touch => touch.id);

    this.recordNewTouchTargets(touchEvent);

    // sometimes Ark reports Move and End events out of order -- don't send touches
    // we already reported as ended to RN.
    touchEvent.touches = touchEvent.touches.filter(touch => this.targetTagByTouchId.has(touch.id));

    touchEvent.touches.forEach(this.convertTouchObject);
    touchEvent.changedTouches = touchEvent.touches.filter(touch => changedIds.includes(touch.id));

    this.removeEndedTouches(touchEvent, changedIds);

    // NOTE: emitting individual component events is done on CPP side,
    // by emitting to each target of a changed touch.
    // This limits the number of NAPI calls that need to be made
    // in case of multiple changed touches.
    // The tag argument here is unused.
    this.rnInstance.emitComponentEvent(-1, RNOHEventEmitRequestHandlerName.Touch, touchEvent);
  }

  public findTargetForTouch(touch: TouchObject): TouchTarget {
    const {x, y} = touch;
    return this.touchTargetHelper.findTouchTarget({x, y}, this.surfaceTag);
  }

  private convertTouchObject(touch: TouchObject): void {
    const {x, y} = touch;
    const targetTag = this.targetTagByTouchId.get(touch.id);
    touch['targetTag'] = targetTag;
    touch['pageX'] = x;
    touch['pageY'] = y;

    const viewPoint =
      this.touchTargetHelper.findViewCoordinates({x, y}, targetTag);
    touch.x = viewPoint.x;
    touch.y = viewPoint.y;
  }

  private recordNewTouchTargets(touchEvent: TouchEvent) {
    if (touchEvent.type === TouchType.Down) {
      for (const touch of touchEvent.changedTouches) {
        const touchTarget = this.findTargetForTouch(touch);
        this.targetTagByTouchId.set(touch.id, touchTarget.tag);
      }
    }
  }

  private removeEndedTouches(touchEvent: TouchEvent, changedIds: number[]) {
    const isTouchEnd = touchEvent.type === TouchType.Up || touchEvent.type === TouchType.Cancel;
    if (isTouchEnd) {
      // `touches` should only contain touches that are still active,
      // so we exclude the touches that just ended
      touchEvent.touches = touchEvent.touches.filter(touch =>!changedIds.includes(touch.id));

      // clear tags for ended touches
      changedIds.forEach(id => this.targetTagByTouchId.delete(id));
    }
  }
}