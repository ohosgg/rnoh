import { ComponentManagerRegistry } from './ComponentManagerRegistry';
import { RNViewManager } from './RNViewManager';
import { Tag, OverflowMode } from './DescriptorBase';
import { DescriptorRegistry } from './DescriptorRegistry';
import { RNOHLogger } from './RNOHLogger';

export type TouchTarget = {
  tag: Tag,
  viewPoint: Point,
}

type Point = {
  x: number,
  y: number,
}

export type PointerEvents = "auto" | "none" | "box-none" | "box-only"

export class TouchTargetHelper {
  constructor(
    private surfaceTag: Tag,
    private descriptorRegistry: DescriptorRegistry,
    private componentManagerRegistry: ComponentManagerRegistry,
    private logger: RNOHLogger
  ) {
  }

  /**
   * Check if the touch is within a view
   * @param x - horizontal offset of the touch, relative to the view
   * @param y - vertical offset of the touch, relative to the view
   * @param tag - tag of the view
   * @returns whether the touch is within the view
   */
  private isPointInView({x, y}: Point, tag: Tag): boolean {
    const componentManager = this.componentManagerRegistry.getComponentManager(tag);
    if (componentManager instanceof RNViewManager) {
      return componentManager.isPointInView({ x, y });
    }
    return false;
  }

  private isPointInBoundingBox({x, y}: Point, tag: Tag): boolean {
    const componentManager = this.componentManagerRegistry.getComponentManager(tag);
    if (componentManager instanceof RNViewManager) {
      return componentManager.isPointInBoundingBox({ x, y });
    }
    return false;
  }

  public findTouchTarget(
    viewPoint: Point,
    parentPoint: Point,
    tag: Tag,
  ): TouchTarget | null {
    const componentManager = this.componentManagerRegistry.getComponentManager(tag);
    if (!(componentManager instanceof RNViewManager)) {
      return null;
    }
    const descriptor = this.descriptorRegistry.getDescriptor(tag);
    if (!descriptor) {
      return null;
    }

    const pointerEvents = descriptor.props["pointerEvents"] ?? "auto" as PointerEvents
    let canHandleTouch = ["auto", "box-only"].includes(pointerEvents)
    const canChildrenHandleTouch = ["auto", "box-none"].includes(pointerEvents)

    if (!canHandleTouch && !canChildrenHandleTouch) {
      return null
    }

    if (!this.isPointInView(viewPoint, tag)) {
      const overflow = descriptor.props['overflow'];
      if (overflow === OverflowMode.HIDDEN
        || overflow === OverflowMode.SCROLL
        || !this.isPointInBoundingBox(parentPoint, tag)) {
        return null;
      }

      canHandleTouch = false;
    }

    if (canChildrenHandleTouch) {
      // Let the component decide which child node responds to the event first.
      const activeChildrenTags = componentManager.getActiveChildrenTags();
      for (const childTag of activeChildrenTags) {
        const childPoint = componentManager.getRelativePoint(viewPoint, childTag);
        const childTarget = this.findTouchTarget(childPoint, viewPoint, childTag);
        if (childTarget !== null) {
          return childTarget;
        }
      }
    }

    if (canHandleTouch) {
      return { viewPoint, tag };
    }

    return null;
  }

  public findViewCoordinates(point: Point, viewTag: Tag): Point {
    const path = [];
    let currentTag = viewTag;
    let currentDescriptor = this.descriptorRegistry.getDescriptor(currentTag);
    while (currentTag !== undefined && currentTag !== this.surfaceTag) {
      path.push(currentTag);
      currentTag = currentDescriptor.parentTag;
      currentDescriptor = this.descriptorRegistry.getDescriptor(currentTag);
    }
    if (currentTag !== this.surfaceTag) {
      // the view isn't a descendant of surfaceTag - we bail
      throw new Error("findViewCoordinates called for view not in the surface")
    }

    const viewPoint = path.reduceRight(
      (point, tag) => {
        const componentManager = this.componentManagerRegistry.getComponentManager(currentTag);
        currentTag = tag;
        if (componentManager instanceof RNViewManager) {
          return componentManager.getRelativePoint(point, tag)
        }
        return point;
      },
      point,
    );

    return viewPoint;
  }
}