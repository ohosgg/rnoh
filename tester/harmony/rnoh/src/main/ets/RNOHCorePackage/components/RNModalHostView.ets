import display from '@ohos.display';
import { Size } from '../../RNOH'
import { Descriptor } from '../../RNOH/DescriptorBase';
import { Tag } from '../../RNOH/DescriptorBase'
import { RNOHContext } from '../../RNOH/RNOHContext'
import { ViewBaseProps } from './RNViewBase'
import { TouchDispatcher } from '../../RNOH/TouchDispatcher'
import { RNModalHostViewManager } from '../componentManagers/RNModalHostViewManager';
import { CustomComponentBuilder } from './RNComponentFactory'

interface ModalHostViewProps extends ViewBaseProps {
  transparent: boolean;
  visible: boolean;
  identifier: number;
};

interface ModalHostViewState {
  screenSize: Size
};
type ModalHostViewDescriptor = Descriptor<"ModalHostView", ModalHostViewProps, ModalHostViewState>;

function closeTo(a: number, b: number) {
  return Math.abs(a - b) < 0.1
}

@CustomDialog
struct ModalHostViewDialog {
  public ctx!: RNOHContext
  public tag!: Tag
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  @State descriptor: ModalHostViewDescriptor = Object() as ModalHostViewDescriptor
  controller: CustomDialogController
  @State showContent: boolean = false
  unsubscribeFromDescriptorChanges: () => void | undefined = () => {
  }
  touchDispatcher!: TouchDispatcher;
  componentManager!: RNModalHostViewManager;

  emitComponentEvent(eventName: string) {
    this.ctx.rnInstanceManager.emitComponentEvent(this.tag, eventName, {});
  }

  aboutToAppear() {
    this.emitComponentEvent("onShow")
    this.componentManager = new RNModalHostViewManager(this.tag, this.ctx);
    this.ctx.componentManagerRegistry.registerComponentManager(this.tag, this.componentManager);
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<ModalHostViewDescriptor>(this.tag)
    this.unsubscribeFromDescriptorChanges = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag, (descriptor) => {
      this.descriptor = (descriptor as ModalHostViewDescriptor)
      // NOTE: this should ensure we only update the Stack's dimensions
      // after React rerenders the contents,
      // to prevent flickering when opening the modal
      this.showContent = true
    })
    this.touchDispatcher = new TouchDispatcher(this.tag, this.ctx.rnInstance, this.ctx.logger);

    const displayClass = display.getDefaultDisplaySync();
    const height = px2vp(displayClass.height);
    const width = px2vp(displayClass.width);
    this.ctx.descriptorRegistry.setState<ModalHostViewState>(this.tag, { screenSize: { height, width } });
  }

  aboutToDisappear() {
    this.emitComponentEvent("onRequestClose")
    this.unsubscribeFromDescriptorChanges?.()
  }

  build() {
    if (this.showContent) {
      Stack() {
        ForEach(this.descriptor.childrenTags, (childrenTag: Tag) => {
          this.buildCustomComponent({
            rnohContext: this.ctx,
            descriptor: this.ctx.descriptorRegistry.getDescriptor(childrenTag)
          })
        }, (childrenTag: Tag) => childrenTag.toString())
      }.onTouch((touchEvent) => this.touchDispatcher.handleTouchEvent(touchEvent))
    }
  }
}

@Component
export struct RNModalHostView {
  public static readonly NAME = "ModalHostView"
  public ctx!: RNOHContext
  public tag: number = 0
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  private dialogController!: CustomDialogController

  aboutToAppear() {
    this.dialogController = new CustomDialogController({
      builder: ModalHostViewDialog({
        ctx: this.ctx,
        tag: this.tag,
        buildCustomComponent: this.buildCustomComponent
      }),
      alignment: DialogAlignment.TopStart,
      customStyle: true,
      maskColor: Color.Transparent
    })

    // on the JS side, the native ModalHostView is rendered _only_ if the `visible` prop is set to true,
    // so we can completely ignore it and just open/close when this component appears/disappears
    this.dialogController.open()
  }

  aboutToDisappear() {
    this.dialogController?.close()
  }

  build() {
  }
}
