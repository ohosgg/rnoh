import type { ComponentManagerRegistry } from './ComponentManagerRegistry';
import type { Tag } from './DescriptorBase';
import type { DescriptorRegistry } from './DescriptorRegistry';
import type { RNOHLogger } from './RNOHLogger';
import type { Point } from './types'

/*
 * M      A                   B      N
 * ┌──────┬───────────────────┬──────┐
 * │      │                   │      │
 * ├──────┴─────┐J            │      │
 * │I           │             │      │
 * │            │             │      │
 * │L           │             │      │
 * ├──────┬─────┘K  E         │     F│
 * │      │          ┌────────┴──────┤
 * │      │          │               │
 * │      │          │               │
 * │      │          │               │
 * │      └──────────┤               │
 * │      C         H│        D     G│
 * └─────────────────┴───────────────┘
 * P                                 O
 *
 * View: ABCD
 * Children: [IJKL, EFGH]
 * Bounding box: MNOP
 * Point, ViewPoint: Point relative to top left corner of a View
 * ParentPoint: Point relative to top left corner of a View's parent
 */


export interface TouchTargetHelperDelegate {
  /**
   * @param point - relative to the top left corner of a view
   */
  isPointInView(point: Point): boolean

  /**
   * @param point - relative to the top left corner of a view
   */
  isPointInBoundingBox(point: Point): boolean

  computeChildPoint(parentPoint: Point, childTag: Tag): Point

  isHandlingTouches(): boolean

  canChildrenHandleTouch(): boolean

  canHandleTouch(): boolean

  isClippingChildren(): boolean

  // Let the component decide which child node responds to the event first.
  getActiveChildrenTags(): Tag[]
}


export class TouchTargetHelper {
  public static isTouchTargetHelperDelegate = (obj: any): obj is TouchTargetHelperDelegate => {
    return typeof obj === "object" &&
      "isPointInView" in obj &&
      "isPointInBoundingBox" in obj &&
      "computeChildPoint" in obj &&
      "isHandlingTouches" in obj &&
      "canChildrenHandleTouch" in obj &&
      "canHandleTouch" in obj &&
      "isClippingChildren" in obj &&
      "getActiveChildrenTags" in obj
  };

  constructor(
    private surfaceTag: Tag,
    private descriptorRegistry: DescriptorRegistry,
    private componentManagerRegistry: ComponentManagerRegistry,
    private logger: RNOHLogger
  ) {
  }

  private isViewPointInView({x, y}: Point, viewTag: Tag): boolean {
    const componentManager = this.componentManagerRegistry.getComponentManager(viewTag);
    if (TouchTargetHelper.isTouchTargetHelperDelegate(componentManager)) {
      return componentManager.isPointInView({ x, y });
    }
    return false;
  }

  private isPointInBoundingBox({x, y}: Point, tag: Tag): boolean {
    const componentManager = this.componentManagerRegistry.getComponentManager(tag);
    if (TouchTargetHelper.isTouchTargetHelperDelegate(componentManager)) {
      return componentManager.isPointInBoundingBox({ x, y });
    }
    return false;
  }

  public findTouchTargetTag(
    viewPoint: Point,
    viewTag: Tag,
    parentPoint: Point | null = null
  ): Tag | null {
    const componentManager = this.componentManagerRegistry.getComponentManager(viewTag);
    if (!TouchTargetHelper.isTouchTargetHelperDelegate(componentManager)) {
      return null;
    }

    let canHandleTouch = componentManager.canHandleTouch()
    const canChildrenHandleTouch = componentManager.canChildrenHandleTouch()
    if (!canHandleTouch && !canChildrenHandleTouch) {
      return null
    }

    if (!this.isViewPointInView(viewPoint, viewTag)) {
      if (parentPoint === null
        || componentManager.isClippingChildren()
        || !this.isPointInBoundingBox(parentPoint, viewTag)) {
        return null;
      }
      canHandleTouch = false;
    }

    if (canChildrenHandleTouch) {
      for (const childTag of componentManager.getActiveChildrenTags()) {
        const childPoint = componentManager.computeChildPoint(viewPoint, childTag);
        const childTargetTag = this.findTouchTargetTag(childPoint, childTag, viewPoint);
        if (childTargetTag !== null) {
          return childTargetTag;
        }
      }
    }
    if (canHandleTouch) {
      return viewTag;
    }
    return null;
  }

  public findViewCoordinates(point: Point, viewTag: Tag): Point {
    let currentComponentManager = this.componentManagerRegistry.getComponentManager(viewTag);

    const path: number[] = [];
    let currentTag = viewTag;

    while (currentTag !== undefined && currentTag !== this.surfaceTag) {
      path.push(currentTag);
      currentTag = currentComponentManager.getParentTag();
      currentComponentManager = this.componentManagerRegistry.getComponentManager(currentTag);
    }
    if (currentTag !== this.surfaceTag) {
      // the view isn't a descendant of surfaceTag - we bail
      throw new Error("findViewCoordinates called for view not in the surface")
    }

    const viewPoint = path.reduceRight(
      (point, tag) => {
        const componentManager = this.componentManagerRegistry.getComponentManager(currentTag);
        currentTag = tag;
        if (TouchTargetHelper.isTouchTargetHelperDelegate(componentManager)) {
          return componentManager.computeChildPoint(point, tag)
        }
        return point;
      },
      point,
    );

    return viewPoint;
  }
}