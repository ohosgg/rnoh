import {ParagraphMeasurerError} from './Error';
import {
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
          return this.splitWhilePreservingWhiteSpaceCharacters(
            fragment.content,
          ).map(newContent => ({...fragment, content: newContent}));
        } else {
          return [fragment];
        }
      })
      .flat();
  }

  private splitWhilePreservingWhiteSpaceCharacters(s: string): string[] {
    const regex = /(\s+|[^\s]+)/g;
    return Array.from(s.match(regex) ?? []);
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
      containerConfig.width ?? Number.MAX_SAFE_INTEGER,
    ).map(lineOfMeasuredTokens => ({
      positionedFragments: this.mapMeasuredFragmentsToPositionedFragments(
        this.convertMeasuredTokensToMeasuredFragments(lineOfMeasuredTokens),
      ),
      size: this.getLineSizeFromMeasuredTokens(lineOfMeasuredTokens),
    }));
  }

  private convertMeasuredTokensToMeasuredFragments(
    tokens: MeasuredFragment[],
  ): MeasuredFragment[] {
    if (tokens.length === 0) return [];
    if (tokens.length === 1) return tokens;
    const results: MeasuredFragment[] = [];
    let lhs = tokens[0];
    for (const rhs of tokens.slice(1)) {
      if (this.canMeasuredFragmentsBeJoined(lhs, rhs)) {
        lhs = this.joinFragments(lhs, rhs);
      } else {
        results.push(lhs);
        lhs = rhs;
      }
    }
    results.push(lhs);
    return results;
  }

  private canMeasuredFragmentsBeJoined(
    lhs: MeasuredFragment,
    rhs: MeasuredFragment,
  ): boolean {
    if (lhs.fragment.type !== 'text' || rhs.fragment.type !== 'text')
      return false;
    for (const key of Object.keys(lhs.fragment.extraData)) {
      if (lhs.fragment.extraData[key] !== rhs.fragment.extraData[key]) {
        return false;
      }
    }
    return true;
  }

  private joinFragments(
    lhs: MeasuredFragment,
    rhs: MeasuredFragment,
  ): MeasuredFragment {
    if (lhs.fragment.type !== 'text' || rhs.fragment.type !== 'text') {
      throw new ParagraphMeasurerError('Only Text fragments can be joined');
    }
    return {
      ...lhs,
      size: {...lhs.size, width: lhs.size.width + rhs.size.width},
      fragment: {
        ...lhs.fragment,
        content: lhs.fragment.content + rhs.fragment.content,
      },
    };
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

  private mapMeasuredFragmentsToPositionedFragments(
    measuredFragments: MeasuredFragment[],
  ): PositionedFragment[] {
    const positionedFragments: PositionedFragment[] = [];
    let offsetX = 0;
    let offsetY = 0;
    for (const measuredFragment of measuredFragments) {
      positionedFragments.push({
        ...measuredFragment,
        positionRelativeToLine: {x: offsetX, y: offsetY},
      });
      offsetX += measuredFragment.size.width;
    }
    return positionedFragments;
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
            currentLineTokens.push(currentToken);
            currentLineWidth += currentToken.size.width;
            continue;
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
        } else if (lastSpaceInCurrentLineTokenIdx === undefined) {
          currentLineTokens.push(currentToken);
          currentLineWidth += currentToken.size.width;
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
}
