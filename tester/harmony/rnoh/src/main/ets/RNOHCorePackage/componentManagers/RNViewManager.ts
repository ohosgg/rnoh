import matrix4 from '@ohos.matrix4';
import type {
  BoundingBox,
  ComponentManagerRegistry,
  Descriptor,
  DescriptorRegistry,
  Point,
  RNOHContext,
  Tag,
  TouchTargetHelperDelegate
} from '../../RNOH';
import { ComponentManager, OverflowMode } from '../../RNOH';


export type PointerEvents = "auto" | "none" | "box-none" | "box-only"

export interface HitSlop {
  top: number,
  left: number,
  bottom: number,
  right: number
}

export class RNViewManager extends ComponentManager implements TouchTargetHelperDelegate {
  protected boundingBox: BoundingBox = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
  protected descriptorRegistry: DescriptorRegistry;
  protected componentManagerRegistry: ComponentManagerRegistry;
  protected parentTag: Tag;
  private cleanUpCallbacks: (() => void)[] = []
  private isBoundingBoxDirty = true

  constructor(
    protected tag: Tag,
    ctx: RNOHContext,
  ) {
    super();
    this.descriptorRegistry = ctx.descriptorRegistry;
    this.componentManagerRegistry = ctx.componentManagerRegistry;
    this.parentTag = this.descriptorRegistry.getDescriptor(tag).parentTag!;
    this.cleanUpCallbacks.push(this.descriptorRegistry.subscribeToDescriptorChanges(this.tag, (descriptor) => {
      this.onDescriptorChange(descriptor)
    }))
  }

  public onDestroy() {
    super.onDestroy()
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  protected onDescriptorChange(descriptor: Descriptor) {
    this.markBoundingBoxAsDirty()
  }

  public markBoundingBoxAsDirty() {
    this.isBoundingBoxDirty = true
    const parentComponentManager = this.componentManagerRegistry.getComponentManager(this.parentTag);
    if (parentComponentManager && parentComponentManager instanceof RNViewManager) {
      return parentComponentManager.markBoundingBoxAsDirty();
    }
  }


  /**
   * Check if the touch is within a view
   * @param x - horizontal offset of the touch, relative to the view
   * @param y - vertical offset of the touch, relative to the view
   * @returns whether the touch is within the view
   */
  public isPointInView({x, y}: Point): boolean {
    const descriptor = this.getDescriptor();
    const size = descriptor.layoutMetrics.frame.size;
    const hitSlop = this.getHitSlop()
    const withinX = x >= -hitSlop.left && x <= (size.width + hitSlop.right);
    const withinY = y >= -hitSlop.top && y <= (size.height + hitSlop.bottom);
    return withinX && withinY;
  }

  private getHitSlop(): HitSlop {
    return this.getDescriptor().rawProps["hitSlop"] ?? { top: 0, left: 0, right: 0, bottom: 0 }
  }

  public isPointInBoundingBox({x, y}: Point): boolean {
    const {left, right, top, bottom} = this.getBoundingBox();
    const withinX = x >= left && x <= right;
    const withinY = y >= top && y <= bottom;
    return withinX && withinY;
  }

  public computeChildPoint({x, y}: Point, childTag: Tag): Point {
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

  public getActiveChildrenTags(): Tag[] {
    const descriptor = this.descriptorRegistry.getDescriptor(this.tag);
    // check children tags in reverse order,
    // since the last child is the one on top
    return descriptor.childrenTags.slice().reverse();
  }

  /**
   * @deprecated. Do not call this method.
   * Make sure that onDestroy is called though. This method should be protected.
   * should calculate a new bounding box for the view,
   * and call this method on its parent view if the bounding box changed.
   */
  public updateBoundingBox(): void {
    this.markBoundingBoxAsDirty()
  }

  protected calculateBoundingBox() {
    const descriptor = this.getDescriptor();
    if (!descriptor) {
      return { left: 0, right: 0, top: 0, bottom: 0 };
    }
    const {origin, size} = descriptor.layoutMetrics.frame;
    let newBoundingBox: BoundingBox = {
      left: origin.x,
      right: origin.x + size.width,
      top: origin.y,
      bottom: origin.y + size.height
    };

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
    return newBoundingBox
  }



  /**
   * @returns the bounding box of the view, taking into account any children
   * which might overflow the frame of the view
   */
  public getBoundingBox(): BoundingBox {
    if (this.isBoundingBoxDirty) {
      this.boundingBox = this.calculateBoundingBox()
      this.isBoundingBoxDirty = false
    }
    return this.boundingBox;
  }

  public isHandlingTouches(): boolean {
    return false;
  }

  protected getDescriptor(): Descriptor {
    const descriptor = this.descriptorRegistry.getDescriptor(this.tag);
    if (descriptor === null) throw new Error("Descriptor is not available")
    return descriptor
  }

  public canChildrenHandleTouch(): boolean {
    const descriptor = this.getDescriptor()
    const pointerEvents = descriptor.props["pointerEvents"] ?? "auto" as PointerEvents
    return ["auto", "box-none"].includes(pointerEvents)
  }

  public canHandleTouch(): boolean {
    const descriptor = this.getDescriptor()
    const pointerEvents = descriptor.props["pointerEvents"] ?? "auto" as PointerEvents
    return ["auto", "box-only"].includes(pointerEvents)
  }

  public isClippingChildren(): boolean {
    const descriptor = this.getDescriptor()
    const overflow = descriptor.props['overflow'];
    return overflow === OverflowMode.HIDDEN ||
      overflow === OverflowMode.SCROLL
  }

  public setParentTag(parentTag: Tag): void {
    this.parentTag = parentTag;
  }

  public getParentTag(): Tag {
    return this.parentTag
  }
}