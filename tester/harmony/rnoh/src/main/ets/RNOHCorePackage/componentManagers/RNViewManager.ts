import type {
  BoundingBox,
  ComponentManagerRegistry,
  Descriptor,
  DescriptorRegistry,
  Point,
  RNOHContext,
  Tag,
  TouchTargetHelperDelegate,
  Edges,
} from '../../RNOH';
import { ComponentManager } from '../../RNOH';
import { ViewDescriptorWrapperBase } from "../components/RNViewBase/ViewDescriptorWrapper"


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
    const descriptorWrapper = this.getDescriptorWrapper()!;
    const width = descriptorWrapper.width
    const height = descriptorWrapper.height
    const hitSlop = this.getHitSlop()
    const withinX = x >= -hitSlop.left && x <= (width + hitSlop.right);
    const withinY = y >= -hitSlop.top && y <= (height + hitSlop.bottom);
    return withinX && withinY;
  }

  private getHitSlop(): Edges<number> {
    return this.getDescriptorWrapper()!.hitSlop
  }

  public isPointInBoundingBox({x, y}: Point): boolean {
    const {left, right, top, bottom} = this.getBoundingBox();
    const withinX = x >= left && x <= right;
    const withinY = y >= top && y <= bottom;
    return withinX && withinY;
  }

  public computeChildPoint({x, y}: Point, childTag: Tag): Point {
    const childDescriptor = this.descriptorRegistry.getDescriptor(childTag);
    const descriptorWrapper = new ViewDescriptorWrapperBase(childDescriptor);
    const offset = descriptorWrapper.positionRelativeToParent;
    
    // the center of the view (before applying its transformation),
    // which is the origin of the transformation (relative to parent)
    let transformationOriginX = offset.x + descriptorWrapper.width / 2;
    let transformationOriginY = offset.y + descriptorWrapper.height / 2;

    const inverse = descriptorWrapper.transformationMatrix.invert();

    // transform the vector from the origin of the transformation
    const transformedOffsetFromCenter = inverse.transformPoint([x - transformationOriginX, y - transformationOriginY]);

    // add back the offset of the center relative to the origin of the view
    const localX = transformedOffsetFromCenter[0] + descriptorWrapper.width / 2;
    const localY = transformedOffsetFromCenter[1] + descriptorWrapper.height / 2;
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
    const descriptorWrapper = this.getDescriptorWrapper();
    if (!descriptorWrapper) {
      return { left: 0, right: 0, top: 0, bottom: 0 };
    }
    const origin = descriptorWrapper.positionRelativeToParent;
    let newBoundingBox: BoundingBox = {
      left: origin.x,
      right: origin.x + descriptorWrapper.width,
      top: origin.y,
      bottom: origin.y + descriptorWrapper.height
    };

    if (!descriptorWrapper.isClipping) {
      for (const childTag of descriptorWrapper.childrenTags) {
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

    const transformationMatrix = descriptorWrapper.transformationMatrix;
    const center: [number, number] = [origin.x + descriptorWrapper.width / 2, origin.y + descriptorWrapper.height / 2];

    const [leftX, leftY] = transformationMatrix.transformPoint([newBoundingBox.left - center[0], 0]);
    const [rightX, rightY] = transformationMatrix.transformPoint([newBoundingBox.right - center[0], 0]);
    const [topX, topY] = transformationMatrix.transformPoint([0, newBoundingBox.top - center[1]]);
    const [bottomX, bottomY] = transformationMatrix.transformPoint([0, newBoundingBox.bottom - center[1]]);

    newBoundingBox = {
      left: Math.min(leftX, rightX, topX, bottomX) + center[0],
      right: Math.max(leftX, rightX, topX, bottomX) + center[0],
      top: Math.min(leftY, rightY, topY, bottomY) + center[1],
      bottom: Math.max(leftY, rightY, topY, bottomY) + center[1],
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

  protected getDescriptorWrapper(): ViewDescriptorWrapperBase | null {
    const descriptor = this.getDescriptor()
    if (!descriptor) {
      return null
    }
    return new ViewDescriptorWrapperBase(descriptor)
  }

  public canChildrenHandleTouch(): boolean {
    const descriptorWrapper = this.getDescriptorWrapper()
    return descriptorWrapper?.pointerEvents == "auto" || descriptorWrapper?.pointerEvents == "box-none"
  }

  public canHandleTouch(): boolean {
    const descriptorWrapper = this.getDescriptorWrapper()
    return descriptorWrapper?.pointerEvents == "auto" || descriptorWrapper?.pointerEvents == "box-only"
  }

  public isClippingChildren(): boolean {
    return this.getDescriptorWrapper()?.isClipping ?? false
  }

  public setParentTag(parentTag: Tag): void {
    this.parentTag = parentTag;
  }

  public getParentTag(): Tag {
    return this.parentTag
  }
}