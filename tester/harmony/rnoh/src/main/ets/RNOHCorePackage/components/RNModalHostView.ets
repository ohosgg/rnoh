import { Descriptor, Tag } from '../../RNOH/DescriptorBase'
import { RNOHContext } from '../../RNOH/RNOHContext'
import { RNViewBase, ViewBaseProps } from './RNViewBase'
import { RNComponentFactory } from '../../RNComponentFactory'

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

@CustomDialog
struct ModalHostViewDialog {
  controller: CustomDialogController
  ctx: RNOHContext
  tag: Tag
  @BuilderParam renderDescriptors: () => void

  emitComponentEvent(eventName: string) {
    this.ctx.rnInstanceManager.emitComponentEvent(this.tag, eventName, {})
  }

  aboutToAppear() {
    this.emitComponentEvent("onShow")
  }

  onLayout(_children, constraints) {
    const { maxHeight, maxWidth } = constraints
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ModalHostViewDescriptor>(this.tag)
    if (!descriptor) {
      return
    }
    const screenSize = descriptor.state.screenSize
    const height = px2vp(maxHeight)
    const width = px2vp(maxWidth)
    if (screenSize.height != height || screenSize.width != width) {
      this.ctx.descriptorRegistry.setState(this.tag, { screenSize: { height, width } })
    }
  }

  aboutToDisappear() {
    this.emitComponentEvent("onRequestClose")
  }

  build() {
    this.renderDescriptors()
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
      customStyle: true
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
