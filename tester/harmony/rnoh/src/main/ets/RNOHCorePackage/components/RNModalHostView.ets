import display from '@ohos.display';
import type { Descriptor} from '../../RNOH/DescriptorBase';
import { Tag } from '../../RNOH/DescriptorBase'
import { RNOHContext } from '../../RNOH/RNOHContext'
import type { ViewBaseProps } from './RNViewBase'
import { TouchDispatcher } from '../../RNOH/TouchDispatcher'
import { RNModalHostViewManager } from '../componentManagers/RNModalHostViewManager';

type ModalHostViewProps = ViewBaseProps & {
  transparent: boolean;
  visible: boolean;
  identifier: number;
};
type ModalHostViewState = {
  screenSize: {
    width: number;
    height: number;
  };
};
type ModalHostViewDescriptor = Descriptor<"ModalHostView", ModalHostViewProps, ModalHostViewState>;

function closeTo(a: number, b: number) {
  return Math.abs(a - b) < 0.1
}

@CustomDialog
struct ModalHostViewDialog {
  controller: CustomDialogController
  ctx: RNOHContext
  tag: Tag
  @BuilderParam renderDescriptors: () => void
  @State showContent: boolean = false
  unsubscribeFromDescriptorChanges: () => void | undefined
  touchDispatcher: TouchDispatcher;
  componentManager: RNModalHostViewManager = undefined;

  emitComponentEvent(eventName: string) {
    this.ctx.rnInstanceManager.emitComponentEvent(this.tag, eventName, {});
  }

  aboutToAppear() {
    this.emitComponentEvent("onShow")
    this.componentManager = new RNModalHostViewManager(this.tag, this.ctx);
    this.ctx.componentManagerRegistry.registerComponentManager(this.tag, this.componentManager);
    this.unsubscribeFromDescriptorChanges = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag, (descriptor: ModalHostViewDescriptor) => {
      // NOTE: this should ensure we only update the Stack's dimensions
      // after React rerenders the contents,
      // to prevent flickering when opening the modal
      this.showContent = true
    })
    this.touchDispatcher = new TouchDispatcher(this.tag, this.ctx.rnInstance, this.ctx.logger);

    const displayClass = display.getDefaultDisplaySync();
    const height = px2vp(displayClass.height);
    const width = px2vp(displayClass.width);
    this.ctx.descriptorRegistry.setState(this.tag, { screenSize: { height, width } });
  }

  aboutToDisappear() {
    this.emitComponentEvent("onRequestClose")
    this.unsubscribeFromDescriptorChanges?.()
  }

  build() {
    if (this.showContent) {
      Stack() {
        this.renderDescriptors()
      }.onTouch((touchEvent) => this.touchDispatcher.handleTouchEvent(touchEvent))
    }
  }
}

@Component
export struct RNModalHostView {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderDescriptors: () => void
  private dialogController: CustomDialogController

  aboutToAppear() {
    this.dialogController = new CustomDialogController({
      builder: ModalHostViewDialog({
        ctx: this.ctx,
        tag: this.tag,
        renderDescriptors: this.renderDescriptors
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
