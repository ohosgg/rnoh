import {ParagraphMeasurerError} from './Error';
import {
  convertMeasuredFragmentsToPositionedFragments,
  reduceMeasuredFragments,
} from './FragmentUtils';
import type {
  ContainerConfig,
  Fragment,
  MeasuredLine,
  WordWrapStrategy,
  TextFragmentMeasurer,
  MeasuredFragment,
  Size,
} from './types';

type Token = Fragment & {canBreakLine: boolean; isIgnoredIfBreaksLine: boolean};
type MeasuredToken = MeasuredFragment & {
  canBreakLine: boolean;
  isIgnoredIfBreaksLine: boolean;
};

export class UnhyphenatedWordWrapStrategy<
  TAttributesMap extends Record<string, any> = any,
> implements WordWrapStrategy
{
  public constructor(
    private textFragmentMeasurer: TextFragmentMeasurer<TAttributesMap>,
  ) {}

  public convertFragmentsIntoLines<
    TTextExtraData extends Record<string, any> = any,
  >(
    fragments: Fragment<TTextExtraData>[],
    containerConfig: ContainerConfig,
  ): MeasuredLine<TTextExtraData>[] {
    const measuredTokens: MeasuredToken[] = this.tokenize(fragments).map(
      this.measureToken.bind(this),
    );
    return this.convertMeasuredTokensToMeasuredLines(
      measuredTokens,
      containerConfig,
    );
  }

  private tokenize(fragments: Fragment[]): Token[] {
    return fragments
      .map(fragment => {
        if (fragment.type === 'text') {
          return this.splitTextFragmentContent(fragment.content).map<Token>(
            newContent => ({
              ...fragment,
              content: newContent,
              canBreakLine: this.canCharacterBreakLine(newContent),
              isIgnoredIfBreaksLine: [' ', '\n'].includes(newContent),
            }),
          );
        } else {
          return [
            {...fragment, canBreakLine: false, isIgnoredIfBreaksLine: false},
          ];
        }
      })
      .flat();
  }

  protected canCharacterBreakLine(c: string): boolean {
    return c === ' ' || isChineseOrJapaneseCharacter(c);
  }

  protected splitTextFragmentContent(s: string): string[] {
    return s.split('');
  }

  private measureToken(token: Token): MeasuredToken {
    if (token.type === 'placeholder') {
      return {
        fragment: token,
        size: {width: token.width, height: token.height},
        canBreakLine: token.canBreakLine,
        isIgnoredIfBreaksLine: token.isIgnoredIfBreaksLine,
      };
    } else if (token.type === 'text') {
      return {
        fragment: token,
        size: this.textFragmentMeasurer.measureTextFragment(token),
        canBreakLine: token.canBreakLine,
        isIgnoredIfBreaksLine: token.isIgnoredIfBreaksLine,
      };
    } else {
      throw new ParagraphMeasurerError(`Unsupported fragment`);
    }
  }

  private convertMeasuredTokensToMeasuredLines(
    measuredTokens: MeasuredToken[],
    containerConfig: ContainerConfig,
  ): MeasuredLine[] {
    return this.distributeMeasuredTokensAcrossLines(
      measuredTokens,
      containerConfig.width || Number.MAX_SAFE_INTEGER,
    ).map(lineOfMeasuredTokens => ({
      positionedFragments: convertMeasuredFragmentsToPositionedFragments(
        reduceMeasuredFragments(lineOfMeasuredTokens),
      ),
      size: this.getLineSizeFromMeasuredTokens(lineOfMeasuredTokens),
    }));
  }

  private getLineSizeFromMeasuredTokens(measuredTokens: MeasuredToken[]): Size {
    const width = measuredTokens
      .map(measuredFragment => measuredFragment.size.width)
      .reduce((sum, width) => sum + width, 0);
    const height = Math.max(
      ...measuredTokens.map(measuredFragment => measuredFragment.size.height),
    );
    return {width, height};
  }

  private distributeMeasuredTokensAcrossLines(
    measuredTokens: MeasuredToken[],
    containerWidth: number,
  ): MeasuredToken[][] {
    const linesOfTokens: MeasuredToken[][] = [];
    let remainingTokens = measuredTokens;
    while (remainingTokens.length > 0) {
      const {nextLine, remainingTokens: newRemainingTokens} = this.getNextLine(
        remainingTokens,
        containerWidth,
      );
      linesOfTokens.push(nextLine);
      remainingTokens = newRemainingTokens;
    }
    return linesOfTokens;
  }

  private getNextLine(
    measuredTokens: MeasuredToken[],
    containerWidth: number,
  ): {nextLine: MeasuredToken[]; remainingTokens: MeasuredToken[]} {
    const currentLineTokens: MeasuredToken[] = [];
    for (
      let currentTokenIdx = 0;
      currentTokenIdx < measuredTokens.length;
      currentTokenIdx++
    ) {
      const {
        currentLineWidth,
        lastBreakableTokenIdxInCurrentLine,
        lastPlaceholderInCurrentLineTokenIdx,
      } = this.extractLineInfo(currentLineTokens);
      const currentToken = measuredTokens[currentTokenIdx];
      const canFitCurrentToken =
        currentLineWidth + currentToken.size.width <= containerWidth;
      if (currentToken.fragment.type === 'text') {
        if (currentToken.fragment.content === '\n') {
          return this.breakLine({
            measuredTokens,
            breakingTokenIdx: currentTokenIdx,
          });
        } else if (currentToken.canBreakLine) {
          if (canFitCurrentToken) {
            currentLineTokens.push(currentToken);
            continue;
          } else {
            return this.breakLine({
              measuredTokens,
              breakingTokenIdx: currentTokenIdx,
            });
          }
        } else {
          if (canFitCurrentToken) {
            currentLineTokens.push(currentToken);
            continue;
          } else if (lastBreakableTokenIdxInCurrentLine === undefined) {
            if (lastPlaceholderInCurrentLineTokenIdx !== undefined) {
              const wordWidth = this.calculateWordWidthAtIndex({
                measuredTokens,
                tokenIdx: currentTokenIdx,
              });
              if (wordWidth < containerWidth) {
                return this.breakLine({
                  measuredTokens,
                  breakingTokenIdx: lastPlaceholderInCurrentLineTokenIdx + 1,
                });
              }
            }
            return this.breakLine({
              measuredTokens,
              breakingTokenIdx: currentTokenIdx,
            });
          } else {
            return this.breakLine({
              measuredTokens,
              breakingTokenIdx: lastBreakableTokenIdxInCurrentLine,
            });
          }
        }
      } else {
        if (currentLineWidth + currentToken.size.width <= containerWidth) {
          currentLineTokens.push(currentToken);
        } else if (lastBreakableTokenIdxInCurrentLine === undefined) {
          currentLineTokens.push(currentToken);
        } else {
          return this.breakLine({
            measuredTokens,
            breakingTokenIdx: currentTokenIdx,
          });
        }
      }
    }
    return {nextLine: currentLineTokens, remainingTokens: []};
  }

  private extractLineInfo(lineTokens: MeasuredToken[]) {
    let lastBreakableTokenIdxInCurrentLine = findLastIndex(
      lineTokens,
      token => token.canBreakLine,
    );
    if (lastBreakableTokenIdxInCurrentLine !== undefined) {
      const isIgnored =
        lineTokens[lastBreakableTokenIdxInCurrentLine].isIgnoredIfBreaksLine;
      // if the breaking token is not ignored, we can also break after it
      if (!isIgnored) {
        lastBreakableTokenIdxInCurrentLine += 1;
      }
    }
    const lastPlaceholderInCurrentLineTokenIdx = findLastIndex(
      lineTokens,
      token => token.fragment.type === 'placeholder',
    );
    const currentLineWidth = lineTokens.reduce(
      (sum, token) => sum + token.size.width,
      0,
    );
    return {
      lastBreakableTokenIdxInCurrentLine,
      lastPlaceholderInCurrentLineTokenIdx,
      currentLineWidth,
    };
  }

  private breakLine({
    measuredTokens,
    breakingTokenIdx,
  }: {
    measuredTokens: MeasuredToken[];
    breakingTokenIdx: number;
  }) {
    const breakingToken = measuredTokens[breakingTokenIdx];
    const newLineStartIdx =
      breakingTokenIdx + (breakingToken.isIgnoredIfBreaksLine ? 1 : 0);
    const nextLine = measuredTokens.slice(0, breakingTokenIdx);
    const remainingTokens = measuredTokens.slice(newLineStartIdx) ?? [];
    return {
      nextLine,
      remainingTokens,
    };
  }

  private calculateWordWidthAtIndex({
    measuredTokens,
    tokenIdx,
  }: {
    measuredTokens: MeasuredToken[];
    tokenIdx: number;
  }) {
    let wordWidth = 0;
    const tokensBefore = measuredTokens.slice(0, tokenIdx);
    const tokensAfter = measuredTokens.slice(tokenIdx);

    for (const tokenBefore of tokensBefore.reverse()) {
      if (
        tokenBefore.fragment.type === 'placeholder' ||
        (tokenBefore.fragment.type === 'text' &&
          tokenBefore.fragment.content === ' ')
      ) {
        break;
      }
      wordWidth += tokenBefore.size.width;
    }
    for (const tokenAfter of tokensAfter) {
      if (
        tokenAfter.fragment.type === 'placeholder' ||
        (tokenAfter.fragment.type === 'text' &&
          tokenAfter.fragment.content === ' ')
      ) {
        break;
      }
      wordWidth += tokenAfter.size.width;
    }
    return wordWidth;
  }
}

export function isChineseOrJapaneseCharacter(character: string) {
  const charCode = character.charCodeAt(0);
  return (
    (charCode >= 0x4e00 && charCode <= 0x9fff) || // Chinese character range
    (charCode >= 0x3400 && charCode <= 0x4dbf) || // Extended Chinese character range
    (charCode >= 0x3000 && charCode <= 0x30ff) || // Japanese character range
    (charCode >= 0x31f0 && charCode <= 0x31ff) || // Katakana Phonetic Extensions range
    (charCode >= 0xff00 && charCode <= 0xffef) // Halfwidth and Fullwidth Forms range
  );
}

function findLastIndex<T>(
  arr: T[],
  predicate: (el: T) => boolean,
): number | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) {
      return i;
    }
  }
  return undefined;
}
