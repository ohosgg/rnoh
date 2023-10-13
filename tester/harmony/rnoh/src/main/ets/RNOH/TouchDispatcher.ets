import { RNOHEventEmitRequestHandlerName } from '../RNOHCorePackage/RNOHEventEmitRequestHandler';
import type { Tag, Descriptor } from './DescriptorBase';
import type { RNInstance } from './RNInstance';
import type { RNOHLogger } from './RNOHLogger';
import { TouchTargetHelper } from './TouchTargetHelper';


export class TouchDispatcher {
  private touchTargetHelper: TouchTargetHelper
  private targetTagByTouchId: Map<number, Tag> = new Map();
  // last reported touch event
  private previousEvent: TouchEvent = undefined;

  constructor(private surfaceTag: Tag, private rnInstance: RNInstance, private logger: RNOHLogger) {
    this.touchTargetHelper = new TouchTargetHelper(surfaceTag, rnInstance.descriptorRegistry, rnInstance.componentManagerRegistry, logger);
  }

  public handleTouchEvent(touchEvent: TouchEvent) {
    const changedIds = touchEvent.changedTouches.map(touch => touch.id);

    // sometimes views are deleted while a touch event is in flight.
    // We remove them from the touch targets registry and don't include them
    // in the touch event.
    this.maybeRemoveDeletedTargets();

    this.recordNewTouchTargets(touchEvent);

    this.cancelHandledTouches(touchEvent.timestamp);

    // only report touches RN we have calculated targets for
    touchEvent.touches = touchEvent.touches.filter(touch => this.targetTagByTouchId.has(touch.id));

    touchEvent.touches.forEach((touch) => this.convertTouchObject(touch));
    touchEvent.changedTouches = touchEvent.touches.filter(touch => changedIds.includes(touch.id));

    this.removeEndedTouches(touchEvent, changedIds);

    if (touchEvent.changedTouches.length === 0) {
      return;
    }

    this.previousEvent = touchEvent;

    // NOTE: emitting individual component events is done on CPP side,
    // by emitting to each target of a changed touch.
    // This limits the number of NAPI calls that need to be made
    // in case of multiple changed touches.
    // The tag argument here is unused.
    this.rnInstance.emitComponentEvent(-1, RNOHEventEmitRequestHandlerName.Touch, touchEvent);
  }

  public findTargetTagForTouch(touch: TouchObject): Tag {
    return this.touchTargetHelper.findTouchTargetTag(touch, this.surfaceTag);
  }

  private convertTouchObject(touch: TouchObject): void {
    const targetTag = this.targetTagByTouchId.get(touch.id);
    touch['targetTag'] = targetTag;
    touch['pageX'] = touch.x;
    touch['pageY'] = touch.y;

    const viewPoint =
    this.touchTargetHelper.findViewCoordinates(touch, targetTag);
    touch.x = viewPoint.x;
    touch.y = viewPoint.y;
  }

  private recordNewTouchTargets(touchEvent: TouchEvent) {
    if (touchEvent.type === TouchType.Down) {
      for (const touch of touchEvent.changedTouches) {
        const touchTargetTag = this.findTargetTagForTouch(touch);
        this.targetTagByTouchId.set(touch.id, touchTargetTag);
      }
    }
  }

  private maybeRemoveDeletedTargets() {
    const deletedTargetIds = Array.from<[number, Tag]>(this.targetTagByTouchId.entries())
      .filter((touchIdAndTargetTag) =>!this.rnInstance.descriptorRegistry.getDescriptor<Descriptor>(touchIdAndTargetTag[1]))
      .map((touchIdAndTargetTag) => touchIdAndTargetTag[0]);
    deletedTargetIds.forEach(id => this.targetTagByTouchId.delete(id));
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

  private cancelHandledTouches(timestamp: number) {
    const cancelledTouchIds = Array.from<[number, Tag]>(this.targetTagByTouchId.entries())
      .filter((touchIdAndTargetTag) => this.shouldCancelTouchesForTag(touchIdAndTargetTag[1]))
      .map((touchIdAndTargetTag) => touchIdAndTargetTag[0]);

    cancelledTouchIds.forEach(touchId => this.targetTagByTouchId.delete(touchId));

    const touchEvent = this.previousEvent;
    this.previousEvent = undefined;

    if (touchEvent === undefined) {
      return;
    }

    const cancelledTouches = touchEvent.touches.filter(touch => cancelledTouchIds.includes(touch.id));

    if (cancelledTouches.length === 0) {
      return;
    }

    touchEvent.changedTouches = cancelledTouches;
    touchEvent.touches = touchEvent.touches.filter(touch =>!cancelledTouches.includes(touch));

    touchEvent.type = TouchType.Cancel;
    touchEvent.timestamp = timestamp;
    this.rnInstance.emitComponentEvent(-1, RNOHEventEmitRequestHandlerName.Touch, touchEvent);
  }

  private shouldCancelTouchesForTag(targetTag: Tag): boolean {
    let currentTag = targetTag;
    while (currentTag !== undefined && currentTag !== this.surfaceTag) {
      const componentManager = this.rnInstance.componentManagerRegistry.getComponentManager(currentTag);
      const descriptor = this.rnInstance.descriptorRegistry.getDescriptor<Descriptor>(currentTag);
      if (!componentManager || !TouchTargetHelper.isTouchTargetHelperDelegate(componentManager) || componentManager.isHandlingTouches()) {
        return true;
      }
      currentTag = descriptor.parentTag;
    }

    // if we didn't reach the surface,
    // this view is either unmounted or no longer handled
    // by this dispatcher -- cancel the touch
    return currentTag === undefined;
  }
}