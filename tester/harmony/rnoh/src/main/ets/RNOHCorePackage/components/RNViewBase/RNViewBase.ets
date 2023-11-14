import { Descriptor, RNOHContext, TransformMatrix } from '../../../RNOH';
import { ViewBaseProps, ViewRawProps } from './types';
import { ViewDescriptorWrapper } from "./ViewDescriptorWrapper"
import { RNViewManager } from '../../componentManagers';
import matrix4 from '@ohos.matrix4'

export interface ViewBaseState {}

export type ViewBaseDescriptor<TType = string,
TProps extends ViewBaseProps = ViewBaseProps,
TState extends ViewBaseState = ViewBaseState,
TRawProps extends ViewRawProps = ViewRawProps> = Descriptor<TType, TProps, TState, TRawProps>;

/**
 * @deprecated: Use ViewBaseDescriptor instead.
 */
export type ViewDynamicDescriptor = Descriptor<string, ViewRawProps>

@Component
export struct RNViewBase {
  public ctx!: RNOHContext
  public tag: number = 0
  public componentManager!: RNViewManager;
  @BuilderParam public renderChildren: () => void
  @State private descriptorWrapper: ViewDescriptorWrapper | undefined = undefined
  private unregisterDescriptorChangesListener?: () => void = undefined
  private unregisterComponentManager?: () => void = undefined

  aboutToAppear() {
    let descriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(this.tag)
    if (!this.componentManager) {
      this.componentManager = new RNViewManager(this.tag, this.ctx)
    }
    this.unregisterComponentManager = this.ctx.componentManagerRegistry.registerComponentManager(this.tag, this.componentManager)
    this.setDescriptor(descriptor)
    const parentTag = descriptor.parentTag;
    this.componentManager.setParentTag(parentTag);
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.setDescriptor(newDescriptor)
      }
    )
  }

  private setDescriptor(descriptor: ViewBaseDescriptor) {
    this.descriptorWrapper = new ViewDescriptorWrapper(descriptor)
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
    this.unregisterComponentManager?.()
  }

  getHitTestMode() {
    switch (this.descriptorWrapper?.pointerEvents) {
      case "none":
        return HitTestMode.None
      case "box-none":
        return HitTestMode.None
      case "box-only":
        return HitTestMode.Block
      default:
        return HitTestMode.Default
    }
  }

  getBorderStyle(): BorderStyle {
    switch (this.descriptorWrapper?.borderStyle) {
      case "dashed":
        return BorderStyle.Dashed
      case "dotted":
        return BorderStyle.Dotted
      default:
        return BorderStyle.Solid
    }
  }

  getTransform(): undefined | matrix4.Matrix4Transit {
    const descriptorWrapper = this.descriptorWrapper
    if (!descriptorWrapper) {
      return undefined
    }
    const rawTransformationMatrix = descriptorWrapper.rawTransformationMatrix.slice()
    rawTransformationMatrix[12] = vp2px(rawTransformationMatrix[12]);
    rawTransformationMatrix[13] = vp2px(rawTransformationMatrix[13]);
    rawTransformationMatrix[14] = vp2px(rawTransformationMatrix[14]);
    return matrix4.init(rawTransformationMatrix as TransformMatrix)
  }

  build() {
    Stack() {
      this.renderChildren()
    }
    .width(this.descriptorWrapper?.width)
    .height(this.descriptorWrapper?.height)
    .backgroundColor(this.descriptorWrapper?.backgroundColor)
    .position(this.descriptorWrapper?.positionRelativeToParent)
    .borderWidth(this.descriptorWrapper?.borderWidth)
    .borderColor(this.descriptorWrapper?.borderColor)
    .borderRadius(this.descriptorWrapper?.borderRadius)
    .borderStyle(this.getBorderStyle())
    .opacity(this.descriptorWrapper?.opacity)
    .transform(this.getTransform())
    .clip(this.descriptorWrapper?.isClipping)
    .hitTestBehavior(this.getHitTestMode())
    .shadow(this.descriptorWrapper?.shadow)
    .id(this.tag.toString())
  }
}
