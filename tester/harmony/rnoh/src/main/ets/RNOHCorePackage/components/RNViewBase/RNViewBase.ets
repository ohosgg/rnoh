import { Descriptor, RNOHContext, TransformMatrix } from '../../../RNOH';
import { ViewBaseProps, ViewRawProps } from './types';
import { ViewDescriptorWrapperBase } from './ViewDescriptorWrapper';
import { RNViewManager } from '../../componentManagers';
import matrix4 from '@ohos.matrix4';

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
  @Prop public customAlign: Alignment = Alignment.TopStart;
  @BuilderParam public renderChildren: () => void
  @State private descriptorWrapper: ViewDescriptorWrapperBase | undefined = undefined
  private unregisterDescriptorChangesListener?: () => void = undefined
  private unregisterComponentManager?: () => void = undefined
  private unregisterCommandCallback?: () => void = undefined

  aboutToAppear() {
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(this.tag)
    if (!this.componentManager) {
      this.componentManager = new RNViewManager(this.tag, this.ctx)
      this.unregisterComponentManager = this.ctx.componentManagerRegistry.registerComponentManager(this.tag, this.componentManager)
    }
    this.onDescriptorChange(descriptor)
    this.maybeLogStartUpTime()
    const parentTag = descriptor.parentTag;
    this.componentManager.setParentTag(parentTag);
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor)
      }
    )
  }

  private onDescriptorChange(descriptor: ViewBaseDescriptor) {
    let descriptorWrapper = this.ctx.descriptorRegistry.findDescriptorWrapperByTag<ViewDescriptorWrapperBase>(descriptor.tag)
    if (!descriptorWrapper || !(descriptorWrapper instanceof ViewDescriptorWrapperBase)) {
      descriptorWrapper = new ViewDescriptorWrapperBase(descriptor)
    }
    this.descriptorWrapper = descriptorWrapper
  }

  private maybeLogStartUpTime() {
    if ((this.descriptorWrapper?.hints ?? []).includes("ready")) {
      this.ctx.rnAbility.markReadiness()
    }
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
    this.unregisterComponentManager?.()
    this.unregisterCommandCallback?.()
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
    .align(this.customAlign)
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
    .accessibilityGroup(this.descriptorWrapper?.accessibilityGroup)
    .accessibilityText(this.descriptorWrapper?.accessibilityText)
    .accessibilityLevel(this.descriptorWrapper?.accessibilityLevel)
    .accessibilityDescription(this.descriptorWrapper?.accessibilityDescription)
  }
}
