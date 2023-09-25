import {
  Paragraph,
  WordWrapStrategy,
  MeasuredParagraph,
  ContainerConfig,
} from './types';

export class ParagraphMeasurer {
  public measureParagraph(
    paragraph: Paragraph,
    {
      wordWrapStrategy,
      containerConfig,
    }: { wordWrapStrategy: WordWrapStrategy; containerConfig: ContainerConfig }
  ): MeasuredParagraph {
    const measuredLines = wordWrapStrategy.convertFragmentsIntoLines(
      paragraph.fragments,
      containerConfig
    );
    const maxLineWidth = Math.max(
      ...measuredLines.map((line) => line.size.width)
    );
    const lineHeightsSum = measuredLines
      .map((line) => line.size.height)
      .reduce((sum, height) => sum + height, 0);

    return {
      measuredLines: measuredLines,
      size: {
        width: containerConfig.width ?? maxLineWidth,
        height: lineHeightsSum,
      },
    };
  }
}
