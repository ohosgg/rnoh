import type {
  Paragraph,
  WordWrapStrategy,
  MeasuredParagraph,
  ContainerConfig,
  MeasuredLine,
  PositionedLine,
  HorizontalAlignment,
  EllipsisInserter,
} from './types';
import {
  convertMeasuredFragmentsToPositionedFragments,
  reduceMeasuredFragments,
} from './FragmentUtils';

export const PLACEHOLDER_SYMBOL = '￼' as const;

export class ParagraphMeasurer {
  public measureParagraph<TTextExtraData extends Record<string, any> = any>(
    paragraph: Paragraph<TTextExtraData>,
    {
      wordWrapStrategy,
      containerConfig,
      ellipsisInserter,
    }: {
      wordWrapStrategy: WordWrapStrategy;
      containerConfig: ContainerConfig;
      ellipsisInserter?: EllipsisInserter<TTextExtraData>;
    },
  ): MeasuredParagraph<TTextExtraData> {
    const horizontalAlignment = containerConfig.horizontalAlignment ?? 'start';
    const lines = wordWrapStrategy.convertFragmentsIntoLines(
      paragraph.fragments,
      containerConfig,
    );
    let includedLines = lines;
    if (containerConfig.maxNumberOfLines) {
      includedLines = lines.slice(0, containerConfig.maxNumberOfLines);
      const excludedLines = lines.slice(containerConfig.maxNumberOfLines);
      if (
        includedLines.length > 0 &&
        excludedLines.length > 0 &&
        ellipsisInserter &&
        containerConfig.width
      ) {
        const newLastLine = ellipsisInserter.insertEllipsis(
          includedLines[includedLines.length - 1],
          excludedLines[0],
          containerConfig.width - ((containerConfig.padding?.left ?? 0) + (containerConfig.padding?.right ?? 0)),
        );
        includedLines = [...includedLines.slice(0, -1), newLastLine];
      }
    }
    includedLines = includedLines.map(includedLine => {
      return {
        ...includedLine,
        positionedFragments: convertMeasuredFragmentsToPositionedFragments(
          reduceMeasuredFragments(includedLine.positionedFragments),
        )
          .map(positionedFragment => {
            if (positionedFragment.fragment.type === 'placeholder') {
              return {
                ...positionedFragment,
                positionRelativeToLine: {
                  x: positionedFragment.positionRelativeToLine.x,
                  // vertically center placeholders
                  y:
                    (includedLine.size.height -
                      positionedFragment.size.height) /
                    2,
                },
              };
            }
            return {
              ...positionedFragment,
              size: {
                ...positionedFragment.size,
                // equalize baselines for text fragments
                height: includedLine.size.height,
              },
            };
          })
          .map(function applyPadding(positionedFragment) {
            return {
              ...positionedFragment,
              positionRelativeToLine: {
                x:
                  positionedFragment.positionRelativeToLine.x +
                  (containerConfig.padding?.left ?? 0),
                y:
                  positionedFragment.positionRelativeToLine.y +
                  (containerConfig.padding?.top ?? 0),
              },
            };
          }),
      };
    });
    const maxLineWidth = Math.max(
      ...includedLines.map(line => line.size.width),
    );
    const lineHeightsSum = includedLines
      .map(line => line.size.height)
      .reduce((sum, height) => sum + height, 0);
    includedLines = this.alignFragmentsHorizontallyIfNecessary(
      containerConfig,
      horizontalAlignment,
      includedLines,
    );
    return {
      positionedLines: this.mapMeasuredLinesToPositionedLines(includedLines),
      size: {
        width: maxLineWidth,
        height: lineHeightsSum,
      },
    };
  }

  private alignFragmentsHorizontallyIfNecessary(
    containerConfig: ContainerConfig,
    horizontalAlignment: HorizontalAlignment,
    lines: MeasuredLine<any>[],
  ) {
    if (
      containerConfig.width !== undefined &&
      horizontalAlignment &&
      horizontalAlignment !== 'start'
    ) {
      return this.alignFragmentsHorizontally(
        lines,
        horizontalAlignment,
        containerConfig.width - ((containerConfig.padding?.left ?? 0) + (containerConfig.padding?.right ?? 0)),
      );
    }
    return lines;
  }

  private alignFragmentsHorizontally(
    lines: MeasuredLine[],
    horizontalAlignment: HorizontalAlignment,
    containerWidth: number,
  ): MeasuredLine[] {
    return lines.map(line => {
      let offsetX = 0;
      switch (horizontalAlignment) {
        case 'center':
          offsetX = (containerWidth - line.size.width) / 2;
          break;
        case 'end':
          offsetX = containerWidth - line.size.width;
          break;
      }
      return {
        ...line,
        positionedFragments: line.positionedFragments.map(
          positionedFragment => {
            return {
              ...positionedFragment,
              positionRelativeToLine: {
                ...positionedFragment.positionRelativeToLine,
                x: positionedFragment.positionRelativeToLine.x + offsetX,
              },
            };
          },
        ),
      };
    });
  }

  private mapMeasuredLinesToPositionedLines(
    measuredLines: MeasuredLine[],
  ): PositionedLine[] {
    let currentOffsetY = 0;
    const positionedLines: PositionedLine[] = [];
    for (const measuredLine of measuredLines) {
      positionedLines.push({
        ...measuredLine,
        positionRelativeToParagraph: {x: 0, y: currentOffsetY},
      });
      currentOffsetY += measuredLine.size.height;
    }
    return positionedLines;
  }
}
