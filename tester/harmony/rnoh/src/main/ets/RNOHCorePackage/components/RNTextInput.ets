import { ColorSegments, convertColorSegmentsToString, Descriptor, RNOHContext } from '../../RNOH'
import { RNViewBase, ViewBaseProps } from './RNViewBase'
import { RNOHEventEmitRequestHandlerName } from './../RNOHEventEmitRequestHandler'

export type TextInputProps = ViewBaseProps & {
  fontColor?: ColorSegments
  fontSize?: number
  text?: string
  editable?: boolean
  caretHidden?: boolean
  selectionColor?: ColorSegments
  secureTextEntry?: boolean
}

export type TextInputRawProps = {
  maxLength?: number
}

function getCaretStyle(caretHidden: boolean): CaretStyle {
  return caretHidden ? { width: 0 } : undefined;
}

export type TextInputDescriptor = Descriptor<"TextInput", TextInputProps, {}, TextInputRawProps>

@Component
export struct RNTextInput {
  ctx: RNOHContext
  tag: number
  @State descriptor: TextInputDescriptor = {} as TextInputDescriptor
  controller: TextInputController = new TextInputController()
  private unregisterDescriptorChangesListener?: () => void = undefined
  private cleanupCommandCallback?: () => void = undefined

  handleChangeEvent(value: string) {
    this.ctx.rnInstanceManager.emitComponentEvent(this.descriptor.tag, RNOHEventEmitRequestHandlerName.TextInputChange, value)
  }

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<TextInputDescriptor>(this.tag)
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as TextInputDescriptor)
      }
    )
    this.cleanupCommandCallback = this.ctx.commandDispatcher.registerCommandCallback(
      this.tag,
      (command) => {
        if (command === 'blur') {
          this.controller.stopEditing();
        }
      });
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
    this.cleanupCommandCallback?.();
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      TextInput({ controller: this.controller })
        .width("100%")
        .height("100%")
        .fontColor(convertColorSegmentsToString(this.descriptor.props.fontColor))
        .fontSize(this.descriptor.props.fontSize)
        .onChange((event) => this.handleChangeEvent(event))
        .enabled(this.descriptor.props.editable)
        .caretStyle(getCaretStyle(this.descriptor.props.caretHidden))
        .type(this.descriptor.props.secureTextEntry ? InputType.Password : undefined)
        .maxLength(this.descriptor.rawProps.maxLength)
        .selectedBackgroundColor(convertColorSegmentsToString(this.descriptor.props.selectionColor))
        .showPasswordIcon(false)
    }
  }
}