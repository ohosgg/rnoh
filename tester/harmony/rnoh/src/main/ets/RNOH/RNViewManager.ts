import matrix4 from '@ohos.matrix4';
import { RNOHContext } from './RNOHContext';
import { ComponentManagerRegistry } from './ComponentManagerRegistry';
import { Descriptor, OverflowMode, Tag } from './DescriptorBase';
import { DescriptorRegistry } from './DescriptorRegistry';
import { BoundingBox, ComponentManager, Point } from './ComponentManager';

export class RNViewManager extends ComponentManager {
  protected boundingBox: BoundingBox = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
  protected descriptorRegistry: DescriptorRegistry;
  protected componentManagerRegistry: ComponentManagerRegistry;

  constructor(
    protected tag: Tag,
    ctx: RNOHContext,
  ) {
    super();
    this.descriptorRegistry = ctx.descriptorRegistry;
    this.componentManagerRegistry = ctx.componentManagerRegistry;
  }

  /**
   * Check if the touch is within a view
   * @param x - horizontal offset of the touch, relative to the view
   * @param y - vertical offset of the touch, relative to the view
   * @param tag - tag of the view
   * @returns whether the touch is within the view
   */
  public isPointInView({x, y}: Point): boolean {
    const descriptor = this.getDescriptor();
    const size = descriptor.layoutMetrics.frame.size;
    // TODO: add hitslops
    const withinX = x >= 0 && x <= size.width;
    const withinY = y >= 0 && y <= size.height;
    return withinX && withinY;
  }

  public isPointInBoundingBox({x, y}: Point): boolean {
    const {left, right, top, bottom} = this.getBoundingBox();
    const withinX = x >= left && x <= right;
    const withinY = y >= top && y <= bottom;
    return withinX && withinY;
  }

  public getRelativePoint({x, y}: Point, childTag: Tag): Point {
    const descriptor = this.descriptorRegistry.getDescriptor(childTag);
    const offset = descriptor.layoutMetrics.frame.origin;
    let localX = x - offset.x;
    let localY = y - offset.y;

    if ("transform" in descriptor.props) {
      const transformArray = (descriptor.props["transform"] as any)
      const transform = matrix4.init(transformArray);
      const inverse = transform.invert();
      const transformedLocal = inverse.transformPoint([localX, localY]);
      localX = transformedLocal[0];
      localY = transformedLocal[1];
    }

    return { x: localX, y: localY };
  }

  /**
   * should calculate a new bounding box for the view,
   * and call this method on its parent view if the bounding box changed.
   */
  public updateBoundingBox(): void {
    const descriptor = this.getDescriptor();
    if (!descriptor) {
      this.boundingBox = { left: 0, right: 0, top: 0, bottom: 0 };
      return;
    }
    const {origin, size} = descriptor.layoutMetrics.frame;
    let newBoundingBox = { left: origin.x, right: origin.x+size.width, top: origin.y, bottom: origin.y+size.height };

    // if the view has overflow, take children into account:
    if ('overflow' in descriptor.props && descriptor.props['overflow'] === OverflowMode.VISIBLE) {
      for (const childTag of descriptor.childrenTags) {
        const childDescriptor = this.descriptorRegistry.getDescriptor(childTag);
        const childManager = this.componentManagerRegistry.getComponentManager(childTag);

        if (!childManager || !(childManager instanceof RNViewManager) || !childDescriptor) {
          continue;
        }
        const childBoundingBox = childManager.getBoundingBox();
        newBoundingBox.left = Math.min(newBoundingBox.left, childBoundingBox.left + origin.x);
        newBoundingBox.right = Math.max(newBoundingBox.right, childBoundingBox.right + origin.x);
        newBoundingBox.top = Math.min(newBoundingBox.top, childBoundingBox.top + origin.y);
        newBoundingBox.bottom = Math.max(newBoundingBox.bottom, childBoundingBox.bottom + origin.y);
      }
    }

    // apply the transform to the view's bounding box
    if ('transform' in descriptor.props) {
      const transformMatrix = matrix4.init(descriptor.props['transform'] as any);
      const [left, top] = transformMatrix.transformPoint([newBoundingBox.left, newBoundingBox.top]);
      const [right, bottom] = transformMatrix.transformPoint([newBoundingBox.right, newBoundingBox.bottom]);
      newBoundingBox = {
        left: Math.min(left, right),
        right: Math.max(left, right),
        top: Math.min(top, bottom),
        bottom: Math.max(top, bottom),
      }
    }

    const oldBoundingBox = this.getBoundingBox();

    const boundingBoxChanged =
            newBoundingBox.left !== oldBoundingBox.left
            || newBoundingBox.top !== oldBoundingBox.top
            || newBoundingBox.right !== oldBoundingBox.right
            || newBoundingBox.bottom !== oldBoundingBox.bottom;

    this.boundingBox = newBoundingBox;
    if (boundingBoxChanged) {
      const parentComponentManager = this.componentManagerRegistry.getComponentManager(descriptor.parentTag);
      if (parentComponentManager instanceof RNViewManager) {
        return void parentComponentManager?.updateBoundingBox();
      }
    }
  }

  /**
   * @returns the bounding box of the view, taking into account any children
   * which might overflow the frame of the view
   */
  public getBoundingBox(): BoundingBox {
    return this.boundingBox;
  }

  protected getDescriptor(): Descriptor {
    return this.descriptorRegistry.getDescriptor(this.tag);
  }
}