import { ColorSegments, convertColorSegmentsToString, Descriptor, RNOHContext } from '../../RNOH';
import { RNViewBase, ViewBaseProps } from './RNViewBase';
import { RNOHEventEmitRequestHandlerName } from './../RNOHEventEmitRequestHandler';

export interface TextInputProps extends ViewBaseProps {
  fontColor?: ColorSegments
  fontSize?: number
  text?: string
  multiline?: boolean
  editable?: boolean
  caretHidden?: boolean
  selectionColor?: ColorSegments
  secureTextEntry?: boolean
  placeholder?: string
  placeholderTextColor?: ColorSegments
  returnKeyType?: string
}

export interface TextInputRawProps {
  maxLength?: number
}

interface TextInputState {}

export type TextInputDescriptor = Descriptor<"TextInput", TextInputProps, TextInputState, TextInputRawProps>

function getCaretStyle(caretHidden: boolean): CaretStyle | undefined {
  return caretHidden ? { width: 0 } : undefined;
}

function stringToEnterKeyType(enterKeyType: string): EnterKeyType {
  switch (enterKeyType) {
    case "done":
      return EnterKeyType.Done
    case "go":
      return EnterKeyType.Go
    case "next":
      return EnterKeyType.Next
    case "search":
      return EnterKeyType.Search
    case "send":
      return EnterKeyType.Send
    default:
      return EnterKeyType.Done // Default value on ArkUI. If we would set undefined, then ArkUI would keep the value that was set earlier.
  }
}

function getFontSize(fontSize: number): number {
  return Number.isNaN(fontSize) ? undefined : fontSize;
}

@Component
export struct RNTextInput {
  ctx!: RNOHContext
  tag: number = 0
  @State descriptor: TextInputDescriptor = Object() as TextInputDescriptor
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
      if (this.descriptor.props.multiline) {
        TextArea({ placeholder: this.descriptor.props.placeholder })
          .width("100%")
          .height("100%")
          .fontColor(convertColorSegmentsToString(this.descriptor.props.fontColor))
          .fontSize(this.descriptor.props.fontSize)
          .placeholderColor(convertColorSegmentsToString(this.descriptor.props.placeholderTextColor))
          .maxLength(this.descriptor.rawProps.maxLength)
      } else {
        TextInput({ controller: this.controller, placeholder: this.descriptor.props.placeholder })
          .width("100%")
          .height("100%")
          .fontColor(convertColorSegmentsToString(this.descriptor.props.fontColor))
          .fontSize(getFontSize(this.descriptor.props.fontSize))
          .onChange((event) => this.handleChangeEvent(event))
          .enabled(this.descriptor.props.editable)
          .caretStyle(getCaretStyle(this.descriptor.props.caretHidden))
          .type(this.descriptor.props.secureTextEntry ? InputType.Password : undefined)
          .maxLength(this.descriptor.rawProps.maxLength)
          .selectedBackgroundColor(convertColorSegmentsToString(this.descriptor.props.selectionColor))
          .showPasswordIcon(false)
          .placeholderColor(convertColorSegmentsToString(this.descriptor.props.placeholderTextColor))
          .enterKeyType(stringToEnterKeyType(this.descriptor.props.returnKeyType))
          /**
          * We set the below props to 0/Transparent because RNViewBase should handle them.
          * We don't want default values set only on the native side, as they break the layout.
          */
          .padding(0)
          .borderRadius(0)
          .backgroundColor(Color.Transparent)
      }
    }
  }
}