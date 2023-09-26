import {
  Paragraph,
  WordWrapStrategy,
  MeasuredParagraph,
  ContainerConfig,
  MeasuredLine,
  PositionedLine,
} from './types';

export class ParagraphMeasurer {
  public measureParagraph<TTextExtraData extends Record<string, any> = any>(
    paragraph: Paragraph<TTextExtraData>,
    {
      wordWrapStrategy,
      containerConfig,
    }: {wordWrapStrategy: WordWrapStrategy; containerConfig: ContainerConfig},
  ): MeasuredParagraph<TTextExtraData> {
    const lines = wordWrapStrategy.convertFragmentsIntoLines(
      paragraph.fragments,
      containerConfig,
    );
    const maxLineWidth = Math.max(...lines.map(line => line.size.width));
    const lineHeightsSum = lines
      .map(line => line.size.height)
      .reduce((sum, height) => sum + height, 0);
    return {
      positionedLines: this.mapMeasuredLinesToPositionedLines(lines),
      size: {
        width: containerConfig.width ?? maxLineWidth,
        height: lineHeightsSum,
      },
    };
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
