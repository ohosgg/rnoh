import { RNScrollViewManager } from '../RNOHCorePackage/componentManagers/RNScrollViewManager';
import { ComponentManagerRegistry } from './ComponentManagerRegistry';
import { Tag } from './DescriptorBase';
import { DescriptorRegistry } from './DescriptorRegistry';
import { RNOHLogger } from './RNOHLogger';
import { convertMatrixArrayToMatrix4 } from './CppBridgeUtils';

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
  public isPointInView({x, y}: Point, tag: Tag): boolean {
    const descriptor = this.descriptorRegistry.getDescriptor(tag);
    const size = descriptor.layoutMetrics.frame.size;
    // TODO: add hitslops
    const withinX = x >= 0 && x <= size.width;
    const withinY = y >= 0 && y <= size.height;
    return withinX && withinY;
  }

  public getRelativePoint({x, y}: Point, tag: Tag): Point {
    const descriptor = this.descriptorRegistry.getDescriptor(tag);
    const offset = descriptor.layoutMetrics.frame.origin;
    let localX = x - offset.x;
    let localY = y - offset.y;

    const parentComponentManager = this.componentManagerRegistry.getComponentManager(descriptor.parentTag)
    if (parentComponentManager instanceof RNScrollViewManager) {
      const scrollManager = parentComponentManager as RNScrollViewManager;
      const scroller = scrollManager.getScroller();
      const { xOffset, yOffset } = scroller.currentOffset();
      localX += xOffset;
      localY += yOffset;
    }

    if ("transform" in descriptor.props) {
      const transformArray = (descriptor.props["transform"] as any)
      const transform = convertMatrixArrayToMatrix4(transformArray);
      const inverse = transform.invert()
      const transformedLocal = inverse.transformPoint([localX, localY])
      localX = transformedLocal[0];
      localY = transformedLocal[1];
    }

    return { x: localX, y: localY }
  }

  public findTouchTarget(
    viewPoint: Point,
    tag: Tag,
  ): TouchTarget | null {
    const descriptor = this.descriptorRegistry.getDescriptor(tag);
    const pointerEvents = descriptor.props["pointerEvents"] ?? "auto" as PointerEvents
    const canHandleTouch = ["auto", "box-only"].includes(pointerEvents)
    const canChildrenHandleTouch = ["auto", "box-none"].includes(pointerEvents)

    if (!canHandleTouch && !canChildrenHandleTouch) {
      return null
    }

    if (!this.isPointInView(viewPoint, tag)) {
      // TODO: check overflow once implemented
      return null;
    }

    if (canChildrenHandleTouch) {
      // check children tags in reverse order,
      // since the last child is the one on top
      for (const childTag of descriptor.childrenTags.slice().reverse()) {
        const childPoint = this.getRelativePoint(viewPoint, childTag);
        const childTarget = this.findTouchTarget(childPoint, childTag);
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
      (point, tag) => this.getRelativePoint(point, tag),
      point,
    );

    return viewPoint;
  }
}