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
  textAlign?: string
}

export interface TextInputRawProps {
  maxLength?: number
}

interface TextInputState {}

export type TextInputDescriptor = Descriptor<"TextInput", TextInputProps, TextInputState, TextInputRawProps>

function getCaretStyle(caretHidden: boolean): CaretStyle | undefined {
  return caretHidden ? { width: 0 } : undefined;
}

interface SetTextAndSelectionCommandCallback {
  mostRecentEventCount: number,
  value?: string,
  start: number,
  end: number,
}

function parseSetTextAndSelectionCommandCallback(args: Object[]): SetTextAndSelectionCommandCallback {
  return {
    mostRecentEventCount: args[0] as number,
    value: args[1] as string,
    start: args[2] as number,
    end: args[3] as number,
  }
}

function stringToAlignment(alignment: string) {
  switch (alignment) {
    case "center":
      return TextAlign.Center
    case "right":
      return TextAlign.End
    case "justified":
      return TextAlign.JUSTIFY
    default:
      return TextAlign.Start
  }
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

function getFontSize(fontSize: number): number | undefined {
  return Number.isNaN(fontSize) ? undefined : fontSize;
}

@Component
export struct RNTextInput {
  ctx!: RNOHContext
  tag: number = 0
  @State descriptor: TextInputDescriptor = Object() as TextInputDescriptor
  inputController: TextInputController = new TextInputController();
  areaController: TextAreaController = new TextAreaController();
  @State value: string = ''
  private unregisterDescriptorChangesListener?: () => void = undefined
  private cleanupCommandCallback?: () => void = undefined

  handleChangeEvent(value: string) {
    this.value = value
    this.ctx.rnInstanceManager.emitComponentEvent(this.descriptor.tag, RNOHEventEmitRequestHandlerName.TextInputChange, value)
  }

  onFocusEvent() {
    this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "onFocus", this.value)
  }

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<TextInputDescriptor>(this.tag)
    this.value = this.descriptor.props.text ?? ''
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as TextInputDescriptor)
      }
    )
    this.cleanupCommandCallback = this.ctx.commandDispatcher.registerCommandCallback(
      this.tag,
      (command, args: Object[]) => {
        if (command === 'blur') {
          if (this.descriptor.props.multiline) {
            this.areaController.stopEditing();
          }
          else {
            this.inputController.stopEditing();
          }
        }
        else if (command === 'setTextAndSelection') {
          const parsedArgs = parseSetTextAndSelectionCommandCallback(args);
          if (parsedArgs.value) {
            this.value = parsedArgs.value;
          }
        }
      });
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
    this.cleanupCommandCallback?.();
  }

  onSubmitEditing(): void {
    this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "onSubmitEditing", this.value)
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      if (this.descriptor.props.multiline) {
        TextArea({ controller: this.areaController, placeholder: this.descriptor.props.placeholder, text: this.value })
          .width("100%")
          .height("100%")
          .fontColor(convertColorSegmentsToString(this.descriptor.props.fontColor))
          .fontSize(getFontSize(this.descriptor.props.fontSize))
          .onChange((value) => this.handleChangeEvent(value))
          .enabled(this.descriptor.props.editable)
          .maxLength(this.descriptor.rawProps.maxLength)
          .placeholderColor(convertColorSegmentsToString(this.descriptor.props.placeholderTextColor))
          .textAlign(stringToAlignment(this.descriptor.props.textAlign))
          /*
           * We set the below props to 0/Transparent because RNViewBase should handle them.
           * We don't want default values set only on the native side, as they break the layout.
           */
          .padding(0)
          .borderRadius(0)
          .backgroundColor(Color.Transparent)
          .onFocus(() => this.onFocusEvent())
      } else {
        TextInput({
          controller: this.inputController,
          placeholder: this.descriptor.props.placeholder,
          text: this.value
        })
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
          .textAlign(stringToAlignment(this.descriptor.props.textAlign))
          /*
           * We set the below props to 0/Transparent because RNViewBase should handle them.
           * We don't want default values set only on the native side, as they break the layout.
           */
          .padding(0)
          .borderRadius(0)
          .backgroundColor(Color.Transparent)
          .onSubmit(() => this.onSubmitEditing())
          .onFocus(() => this.onFocusEvent())
      }
    }
  }
}