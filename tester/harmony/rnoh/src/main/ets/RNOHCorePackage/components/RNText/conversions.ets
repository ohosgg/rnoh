import { convertColorSegmentsToString } from '../../../RNOH/CppBridgeUtils';
import { EllipsizeMode, TextShadowProps } from './types';

export function stringToAlignment(alignment?: string) {
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
      return Alignment.TopStart
  }
}

const ALIGNMENT_MAP: Record<string, Record<string, Alignment>> = {
  "start": {
    "top": Alignment.TopStart,
    "center": Alignment.Start,
    "bottom": Alignment.BottomStart
  },
  "center": {
    "top": Alignment.Top,
    "center": Alignment.Center,
    "bottom": Alignment.Bottom
  },
  "right": {
    "top": Alignment.TopEnd,
    "center": Alignment.End,
    "bottom": Alignment.BottomEnd
  }
};

export function stringToStackAlignment(alignment: string = "start", verticalAlignment: string = "top") {
  if (verticalAlignment === "auto") { // auto is passed from React
    verticalAlignment = "top";
  }
  if (alignment === "start") {
    if (verticalAlignment === "top")
      return Alignment.TopStart
    if (verticalAlignment === "center")
      return Alignment.Start;
    if (verticalAlignment === "bottom")
      return Alignment.BottomStart
  }
  return ALIGNMENT_MAP[alignment]?.[verticalAlignment] || Alignment.TopStart;
}

export function stringToFontStyle(style: string | undefined): FontStyle {
  if (style === 'italic') {
    return FontStyle.Italic;
  }
  return FontStyle.Normal;
}

export function stringToTextTransform(textTransform?: string) {
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

export function getLetterSpacing(letterSpacing?: number) {
  if (Number.isNaN(letterSpacing)) {
    return undefined
  }
  return letterSpacing
}

export function getMaxLines(maximumNumberOfLines?: number) {
  return (maximumNumberOfLines ?? 0) > 0 ? maximumNumberOfLines : undefined
}

export function getTextShadow(textShadowProps: TextShadowProps | undefined): ShadowOptions | undefined {
  const shadowRadius = textShadowProps?.textShadowRadius
  if (shadowRadius === undefined || shadowRadius === 0)
    return undefined
  const result: ShadowOptions = {
    radius: shadowRadius,
    color: convertColorSegmentsToString(textShadowProps?.textShadowColor),
    offsetX: textShadowProps?.textShadowOffset?.width,
    offsetY: textShadowProps?.textShadowOffset?.height,
  }
  return result
}

export function capitalizeTextIfNecessary(text: string, textTransform?: string): string {
  if (textTransform != 'capitalize') {
    return text
  }
  let words = text.split(' ');
  let transformedWords = words.map(word => {
    if (word && Number.isNaN(Number(word[0]))) {
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