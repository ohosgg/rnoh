import { convertColorSegmentsToString, Descriptor, RNOHContext } from '../../../RNOH';
import { RNViewBase } from '../RNViewBase';
import { Selection, TextInputProps, TextInputRawProps, TextInputState } from './types';
import { TextInputDescriptorWrapper } from './TextInputDescriptorWrapper';
import { stringToFontStyle } from '../RNText/conversions';
import { RNOHEventEmitRequestHandlerName } from '../..';

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
  private textWasPastedOrCut: boolean = false
  private selection: Selection = { start: 0, end: 0 }
  private valueChanged: boolean = false
  private shouldIgnoreNextSelectionChange: boolean = false

  handleChangeEvent(value: string) {
    this.value = value
    this.valueChanged = true;
  }

  onFocusEvent() {
    if (this.descriptorWrapper?.clearTextOnFocus) {
      this.value = "";
      this.shouldIgnoreNextSelectionChange = true;
    }
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
    focusControl.requestFocus(`fixedBlur${this.tag}`)
    this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "onSubmitEditing", this.value)
  }

  onPasteOrCut(): void {
    this.textWasPastedOrCut = true;
  }

  dispatchKeyEvent(currentSelection: Selection): void {
    if (this.textWasPastedOrCut) {
      this.textWasPastedOrCut = false;
    }
    else if (this.valueChanged) {
      let key: string = "";
      const noPreviousSelection = this.selection.start === this.selection.end;
      const cursorDidNotMove = currentSelection.start === this.selection.start;
      const cursorMovedBackwardsOrAtBeginningOfInput = (currentSelection.start < this.selection.start) || currentSelection.start <= 0;
      if (!cursorMovedBackwardsOrAtBeginningOfInput && (noPreviousSelection || !cursorDidNotMove)) {
        key = this.value.charAt(currentSelection.start - 1);
      }
      this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, "onKeyPress", key);
    }
  }

  dispatchChangeEvent(): void {
    if (this.valueChanged) {
      this.valueChanged = false;
      this.ctx.rnInstance.emitComponentEvent(this.descriptor.tag, RNOHEventEmitRequestHandlerName.TextInputChange, this.value);
    }
  }

  textSelectionChange(currentSelectionStart: number, currentSelectionEnd: number): void {
    if (this.shouldIgnoreNextSelectionChange) {
      this.shouldIgnoreNextSelectionChange = false;
      return;
    }
    /**
     * New values of selection are needed to determine what key was pressed, so this.dispatchKeyEvent needs to be
     * invoked after this callback fires. OnChange callback fires earlier than OnTextSelectionChange, so all this logic
     * needs to be handled here rather than in this.handleChangeEvent. According to RN the keyPress event should fire
     * before changeEvent, so dispatching change event needs to be handled here as well.
     * */
    this.dispatchKeyEvent({ start: currentSelectionStart, end: currentSelectionEnd });
    this.selection = { start: currentSelectionStart, end: currentSelectionEnd };
    this.dispatchChangeEvent();
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      /**
       * Focus hack (1/2)
       * This invisible buttons are needed to solve focusing issues.
       * The first one ensures that the TextInput will not autoFocus when the property is set to false, and the
       * second allows blurring after submitting text.
       * */
      if (!(this.descriptorWrapper?.autoFocus ?? false)) {
        Button()
          .key(`fixedAutoFocus${this.tag}`)
          .width(0)
          .height(0)
          .padding(0)
          .margin(0)
          .defaultFocus(true)
      }
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
          .onPaste(() => this.onPasteOrCut())
          .onCut(() => this.onPasteOrCut())
          .onTextSelectionChange((start, end) => this.textSelectionChange(start, end))
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
          .onPaste(() => this.onPasteOrCut())
          .onCut(() => this.onPasteOrCut())
          .onTextSelectionChange((start, end) => this.textSelectionChange(start, end))
          .key(`TextInput@${this.tag}`)
      }
      /**
       * Focus hack (2/2)
       */
      Button()
        .key(`fixedBlur${this.tag}`)
        .width(0)
        .height(0)
        .padding(0)
        .margin(0)
        .defaultFocus(false)
    }
  }
}