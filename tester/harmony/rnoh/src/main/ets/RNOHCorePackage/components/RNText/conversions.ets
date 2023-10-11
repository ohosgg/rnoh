import { convertColorSegmentsToString } from '../../../RNOH/CppBridgeUtils'
import type { TextShadowProps } from './types';
import { AttributedFragment, EllipsizeMode } from './types'

export function stringToAlignment(alignment: string) {
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

export function stringToVerticalAlign(textAlignVertical: string) {
  switch (textAlignVertical) {
    case "top":
      return Alignment.TopStart
    case "bottom":
      return Alignment.BottomStart
    case "center":
      return Alignment.Start
    default:
      return undefined
  }
}

export function stringToFontStyle(style: string | undefined): FontStyle {
  if (style === 'italic') {
    return FontStyle.Italic;
  }
  return FontStyle.Normal;
}

export function stringToTextTransform(textTransform: string) {
  switch (textTransform) {
    case "uppercase":
      return TextCase.UpperCase
    case "lowercase":
      return TextCase.LowerCase
    default:
      return TextCase.Normal
  }
}

export function ellipsizeModeToTextOverflow(ellipsizeMode: EllipsizeMode): TextOverflow {
  if (ellipsizeMode === EllipsizeMode.Clip) {
    return TextOverflow.Clip
  }
  return TextOverflow.Ellipsis
}

export function getLetterSpacing(letterSpacing: number) {
  if (isNaN(letterSpacing)) {
    return undefined
  }
  return letterSpacing
}

export function getMaxLines(maximumNumberOfLines: number) {
  return (maximumNumberOfLines ?? 0) > 0 ? maximumNumberOfLines : undefined
}

export function getTextShadow(textShadowProps: TextShadowProps | undefined): {
  radius: number;
  color?: string;
  offsetX?: number;
  offsetY?: number;
} | undefined {
  const shadowRadius = textShadowProps?.textShadowRadius

  if (shadowRadius === undefined || shadowRadius === 0)
    return undefined
  const color = textShadowProps.textShadowColor;

  return {
    radius: shadowRadius,
    color: convertColorSegmentsToString(color),
    offsetX: textShadowProps.textShadowOffset?.width,
    offsetY: textShadowProps.textShadowOffset?.height,
  }
}

export function capitalizeTextIfNecessary(text: string, textTransform: string): string {
  if (textTransform != 'capitalize') {
    return text
  }
  let words = text.split(' ');
  let transformedWords = words.map(word => {
    if (word && isNaN(Number(word[0]))) {
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    }
    return word.toLowerCase();
  });

  return transformedWords.join(' ');
}

/*
  * enum class TextDecorationLine {
  *   none,
  *   underline,
  *   line-through,
  *   underline line-through
  * }
  *The 'underline line-through' attribute is not implemented on ArkTS, so it is not implemented here yet.
   */
export function getTextDecorationLine(textDecorationLine: number | undefined) {
  switch (textDecorationLine) {
    case 1:
      return TextDecorationType.Underline;
    case 2:
      return TextDecorationType.LineThrough;
    default:
      return TextDecorationType.None;
  }
}