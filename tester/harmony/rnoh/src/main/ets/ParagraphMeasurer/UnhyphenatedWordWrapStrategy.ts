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
  PositionedFragment,
} from './types';

/**
 * MeasuredToken represents a single word or whitespace, whereas MeasuredFragment can consists of many words.
 */
type MeasuredToken = MeasuredFragment & {_type: 'MeasuredToken'};

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

  private tokenize(fragments: Fragment[]): Fragment[] {
    return fragments
      .map(fragment => {
        if (fragment.type === 'text') {
          return this.splitTextFragmentContent(fragment.content).map(
            newContent => ({...fragment, content: newContent}),
          );
        } else {
          return [fragment];
        }
      })
      .flat();
  }

  protected splitTextFragmentContent(s: string): string[] {
    return s.split('');
  }

  private measureToken(fragment: Fragment): MeasuredToken {
    if (fragment.type === 'placeholder') {
      return {
        _type: 'MeasuredToken',
        fragment,
        size: {width: fragment.width, height: fragment.height},
      };
    } else if (fragment.type === 'text') {
      return {
        _type: 'MeasuredToken',
        fragment,
        size: this.textFragmentMeasurer.measureTextFragment(fragment),
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
    let lastSpaceInCurrentLineTokenIdx: number | undefined = undefined;
    let lastPlaceholderInCurrentLineTokenIdx: number | undefined = undefined;
    let currentLineWidth = 0;
    let currentLineTokens: MeasuredToken[] = [];

    for (
      let measuredTokenIdx = 0;
      measuredTokenIdx < measuredTokens.length;
      measuredTokenIdx++
    ) {
      const currentToken = measuredTokens[measuredTokenIdx];
      if (currentToken.fragment.type === 'text') {
        if (currentToken.fragment.content === '\n') {
          return this.prepareNewLine({
            measuredTokens,
            lineEndIdx: measuredTokenIdx,
            remainingTokenIdx: measuredTokenIdx + 1,
          });
        } else if (currentToken.fragment.content === ' ') {
          if (currentLineWidth + currentToken.size.width <= containerWidth) {
            const nextToken =
              measuredTokenIdx + 1 < measuredTokens.length
                ? measuredTokens[measuredTokenIdx + 1]
                : undefined;
            if (nextToken) {
              if (
                currentLineWidth +
                  currentToken.size.width +
                  nextToken.size.width <=
                containerWidth
              ) {
                currentLineTokens.push(currentToken);
                currentLineWidth += currentToken.size.width;
                lastSpaceInCurrentLineTokenIdx = currentLineTokens.length - 1;
                continue;
              } else {
                return this.prepareNewLine({
                  measuredTokens,
                  lineEndIdx: measuredTokenIdx,
                  remainingTokenIdx: measuredTokenIdx + 1,
                });
              }
            } else {
              currentLineTokens.push(currentToken);
              currentLineWidth += currentToken.size.width;
              lastSpaceInCurrentLineTokenIdx = currentLineTokens.length - 1;
              continue;
            }
          } else {
            return this.prepareNewLine({
              measuredTokens,
              lineEndIdx: measuredTokenIdx,
              remainingTokenIdx: measuredTokenIdx + 1,
            });
          }
        } else {
          if (currentLineWidth + currentToken.size.width <= containerWidth) {
            currentLineTokens.push(currentToken);
            currentLineWidth += currentToken.size.width;
            continue;
          } else if (lastSpaceInCurrentLineTokenIdx === undefined) {
            if (lastPlaceholderInCurrentLineTokenIdx !== undefined) {
              const wordWidth = this.calculateWordWidthAtIndex({
                measuredTokens,
                tokenIdx: measuredTokenIdx,
              });
              if (wordWidth < containerWidth) {
                return this.prepareNewLine({
                  measuredTokens,
                  lineEndIdx: lastPlaceholderInCurrentLineTokenIdx + 1,
                  remainingTokenIdx: lastPlaceholderInCurrentLineTokenIdx + 1,
                });
              }
            }
            return this.prepareNewLine({
              measuredTokens,
              lineEndIdx: measuredTokenIdx,
              remainingTokenIdx: measuredTokenIdx,
            });
          } else {
            return this.prepareNewLine({
              measuredTokens,
              lineEndIdx: lastSpaceInCurrentLineTokenIdx,
              remainingTokenIdx: lastSpaceInCurrentLineTokenIdx + 1,
            });
          }
        }
      } else {
        if (currentLineWidth + currentToken.size.width <= containerWidth) {
          currentLineTokens.push(currentToken);
          currentLineWidth += currentToken.size.width;
          lastPlaceholderInCurrentLineTokenIdx = measuredTokenIdx;
        } else if (lastSpaceInCurrentLineTokenIdx === undefined) {
          currentLineTokens.push(currentToken);
          currentLineWidth += currentToken.size.width;
          lastPlaceholderInCurrentLineTokenIdx = measuredTokenIdx;
        } else {
          return this.prepareNewLine({
            measuredTokens,
            lineEndIdx: measuredTokenIdx + 1,
          });
        }
      }
    }
    return {nextLine: currentLineTokens, remainingTokens: []};
  }

  private prepareNewLine({
    measuredTokens,
    lineEndIdx,
    remainingTokenIdx,
  }: {
    measuredTokens: MeasuredToken[];
    lineEndIdx: number;
    remainingTokenIdx?: number;
  }) {
    const nextLine = measuredTokens.slice(0, lineEndIdx);
    const remainingTokens =
      measuredTokens.slice(remainingTokenIdx ?? lineEndIdx) ?? [];
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
