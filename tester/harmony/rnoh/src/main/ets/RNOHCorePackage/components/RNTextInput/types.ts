import type { ColorSegments } from '../../../RNOH/DescriptorBase'
import type { ViewBaseProps, ViewRawProps } from '../ts'

export interface TextInputProps extends ViewBaseProps {
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
  autoFocus?: boolean
  keyboardType?: string
}

export interface TextInputRawProps extends ViewRawProps {
  maxLength?: number
  fontWeight?: number
  fontColor?: ColorSegments
  fontFamily?: string
  fontSize?: number
  fontStyle?: string
  focusable?: boolean
}

export interface TextInputState {}
