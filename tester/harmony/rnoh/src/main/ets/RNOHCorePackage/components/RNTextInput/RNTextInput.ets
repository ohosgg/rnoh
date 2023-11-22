import { convertColorSegmentsToString, Descriptor, RNOHContext } from '../../../RNOH';
import { RNViewBase } from '../RNViewBase';
import { RNOHEventEmitRequestHandlerName } from '../../RNOHEventEmitRequestHandler';
import { TextInputProps, TextInputRawProps, TextInputState } from './types';
import { TextInputDescriptorWrapper } from './TextInputDescriptorWrapper';
import { stringToFontStyle } from '../RNText/conversions';

export type TextInputDescriptor = Descriptor<"TextInput", TextInputProps, TextInputState, TextInputRawProps>

function getCaretStyle(caretHidden: boolean | undefined): CaretStyle | undefined {
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

function getInputType(keyboardType: string, secureTextEntry?: boolean): InputType {
  if (secureTextEntry) {
    return InputType.Password;
  }
  switch (keyboardType) {
    case "numberPad":
    case "decimalPad":
    case "numeric":
      return InputType.Number;
    case "phonePad":
      return InputType.PhoneNumber;
    case "emailAddress":
      return InputType.Email;
    default:
      return InputType.Normal
  }
}

@Component
export struct RNTextInput {
  ctx!: RNOHContext
  tag: number = 0
  @State descriptor: TextInputDescriptor = Object() as TextInputDescriptor
  @State private descriptorWrapper: TextInputDescriptorWrapper | undefined = undefined
  inputController: TextInputController = new TextInputController();
  areaController: TextAreaController = new TextAreaController();
  @State value: string = '';
  private unregisterDescriptorChangesListener?: () => void = undefined
  private cleanupCommandCallback?: () => void = undefined

  handleChangeEvent(value: string) {
    this.value = value
    this.ctx.rnInstanceManager.emitComponentEvent(this.descriptor.tag, RNOHEventEmitRequestHandlerName.TextInputChange, value)
  }

  onFocusEvent() {
    this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "onFocus", this.value)
  }

  onBlurEvent() {
    this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "onBlur", this.value)
  }

  onDescriptorChange(newDescriptor: TextInputDescriptor) {
    this.descriptor = newDescriptor;
    this.descriptorWrapper = new TextInputDescriptorWrapper(this.descriptor)
  }

  aboutToAppear() {
    const newDescriptor = this.ctx.descriptorRegistry.getDescriptor<TextInputDescriptor>(this.tag);
    this.value = newDescriptor.props.text ?? '';
    this.onDescriptorChange(newDescriptor);
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor as TextInputDescriptor);
      }
    )
    this.cleanupCommandCallback = this.ctx.componentCommandReceiver.registerCommandCallback(
      this.tag,
      (command, args: Object[]) => {
        if (command === 'blur') {
          if (this.descriptor.props.multiline) {
            this.areaController.stopEditing();
          }
          else {
            this.inputController.stopEditing();
          }
        } else if (command === 'setTextAndSelection') {
          const parsedArgs = parseSetTextAndSelectionCommandCallback(args);
          if (parsedArgs.value !== undefined) {
            this.value = parsedArgs.value;
          }
        } else if (command === 'focus') {
          focusControl.requestFocus(`TextInput@${this.tag}`)
        }
      });
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
    this.cleanupCommandCallback?.();
  }

  onSubmitEditing(): void {
    focusControl.requestFocus(`fixedAutoFocus${this.tag}`)
    this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "onSubmitEditing", this.value)
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      // patch: solve autofocus issues
      Button()
        .key(`fixedAutoFocus${this.tag}`)
        .width(0)
        .height(0)
        .padding(0)
        .margin(0)
        .defaultFocus(!(this.descriptorWrapper?.autoFocus ?? false))
      if (this.descriptor.props.multiline) {
        TextArea({ controller: this.areaController, placeholder: this.descriptor.props.placeholder, text: this.value })
          .fontColor(this.descriptorWrapper?.fontColor)
          .fontFamily(this.descriptorWrapper?.fontFamily)
          .fontSize(this.descriptorWrapper?.fontSize)
          .fontWeight(this.descriptorWrapper?.fontWeight)
          .fontStyle(stringToFontStyle(this.descriptorWrapper?.fontStyle))
          .onChange((value) => this.handleChangeEvent(value))
          .enabled(this.descriptor.props.editable ?? true)
          .maxLength(this.descriptor.rawProps.maxLength)
          .placeholderColor(convertColorSegmentsToString(this.descriptor.props.placeholderTextColor))
          .placeholderFont({
            size: this.descriptorWrapper?.fontSize,
            family: this.descriptorWrapper?.fontFamily ?? "HarmonyOS Sans",
            weight: this.descriptorWrapper?.fontWeight ?? FontWeight.Normal,
            style: stringToFontStyle(this.descriptorWrapper?.fontStyle)
          })
          .textAlign(stringToAlignment(this.descriptor.props.textAlign))/*
           * We set the below props to 0/Transparent because RNViewBase should handle them.
           * We don't want default values set only on the native side, as they break the layout.
           */
          .padding(0)
          .borderRadius(0)
          .backgroundColor(Color.Transparent)
          .onFocus(() => this.onFocusEvent())
          .defaultFocus(this.descriptorWrapper?.autoFocus ?? false)
          .onBlur(() => this.onBlurEvent())/*
           * We need to handle padding manually as TextArea does not handle padding correctly
           * - it does not respect percentage padding and the scroll area size is to big */
          .position({ x: this.descriptorWrapper?.position.x, y: this.descriptorWrapper?.position.y })
          .width(this.descriptorWrapper?.contentWidth)
          .height(this.descriptorWrapper?.contentHeight)
          .responseRegion({
            x: -(this.descriptorWrapper?.position.x ?? 0),
            y: -(this.descriptorWrapper?.position.y ?? 0),
            width: this.descriptorWrapper?.width,
            height: this.descriptorWrapper?.height
          })
          .key(`TextInput@${this.tag}`)
      } else {
        TextInput({
          controller: this.inputController,
          placeholder: this.descriptor.props.placeholder,
          text: this.value
        })
          .fontColor(this.descriptorWrapper?.fontColor)
          .fontFamily(this.descriptorWrapper?.fontFamily)
          .fontSize(this.descriptorWrapper?.fontSize)
          .fontWeight(this.descriptorWrapper?.fontWeight)
          .fontStyle(stringToFontStyle(this.descriptorWrapper?.fontStyle))
          .onChange((event) => this.handleChangeEvent(event))
          .enabled(this.descriptor.props.editable ?? true)
          .caretStyle(getCaretStyle(this.descriptor.props.caretHidden))
          .type(getInputType(this.descriptor.props.keyboardType, this.descriptor.props.secureTextEntry))
          .maxLength(this.descriptor.rawProps.maxLength)
          .selectedBackgroundColor(convertColorSegmentsToString(this.descriptor.props.selectionColor))
          .showPasswordIcon(false)
          .placeholderColor(convertColorSegmentsToString(this.descriptor.props.placeholderTextColor))
          .placeholderFont({
            size: this.descriptorWrapper?.fontSize,
            family: this.descriptorWrapper?.fontFamily ?? "HarmonyOS Sans",
            weight: this.descriptorWrapper?.fontWeight ?? FontWeight.Normal,
            style: stringToFontStyle(this.descriptorWrapper?.fontStyle)
          })
          .enterKeyType(stringToEnterKeyType(this.descriptor.props.returnKeyType))
          .textAlign(stringToAlignment(this.descriptor.props.textAlign))/*
           * We set the below props to 0/Transparent because RNViewBase should handle them.
           * We don't want default values set only on the native side, as they break the layout.
           */
          .padding(0)
          .borderRadius(0)
          .backgroundColor(Color.Transparent)
          .onSubmit(() => this.onSubmitEditing())
          .onFocus(() => this.onFocusEvent())
          .defaultFocus(this.descriptorWrapper?.autoFocus ?? false)
          .onBlur(() => this.onBlurEvent())/*
           * We need to handle padding manually as TextInput does not handle padding correctly
           * - the text is always centered. */
          .position({ x: this.descriptorWrapper?.position.x, y: this.descriptorWrapper?.position.y })
          .width(this.descriptorWrapper?.contentWidth)
          .height(this.descriptorWrapper?.contentHeight)
          .responseRegion({
            x: -(this.descriptorWrapper?.position.x ?? 0),
            y: -(this.descriptorWrapper?.position.y ?? 0),
            width: this.descriptorWrapper?.width,
            height: this.descriptorWrapper?.height
          })
          .key(`TextInput@${this.tag}`)
      }
    }
  }
}