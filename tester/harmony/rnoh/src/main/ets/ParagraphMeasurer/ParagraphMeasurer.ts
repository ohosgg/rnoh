import type {
  Paragraph,
  WordWrapStrategy,
  MeasuredParagraph,
  ContainerConfig,
  MeasuredLine,
  PositionedLine,
  HorizontalAlignment,
} from './types';

export const PLACEHOLDER_SYMBOL = '￼' as const;

export class ParagraphMeasurer {
  public measureParagraph<TTextExtraData extends Record<string, any> = any>(
    paragraph: Paragraph<TTextExtraData>,
    {
      wordWrapStrategy,
      containerConfig,
    }: {wordWrapStrategy: WordWrapStrategy; containerConfig: ContainerConfig},
  ): MeasuredParagraph<TTextExtraData> {
    const horizontalAlignment = containerConfig.horizontalAlignment ?? 'start';
    let lines = wordWrapStrategy.convertFragmentsIntoLines(
      paragraph.fragments,
      containerConfig,
    );
    const maxLineWidth = Math.max(...lines.map(line => line.size.width));
    const lineHeightsSum = lines
      .map(line => line.size.height)
      .reduce((sum, height) => sum + height, 0);
    lines = this.alignFragmentsHorizontallyIfNecessary(
      containerConfig,
      horizontalAlignment,
      lines,
    );
    return {
      positionedLines: this.mapMeasuredLinesToPositionedLines(lines),
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
        containerConfig.width,
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
