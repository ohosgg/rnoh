import {
  EllipsisInserter,
  MeasuredFragment,
  MeasuredLine,
  Position,
  PositionedFragment,
  Size,
  TextFragment,
  TextFragmentMeasurer,
} from './types';

export class TailEllipsisInserter<TTextExtraData extends Record<string, any>>
  implements EllipsisInserter<TTextExtraData>
{
  constructor(
    private textFragmentMeasurer: TextFragmentMeasurer<TTextExtraData>,
  ) {}

  public insertEllipsis(
    lastVisibleLine: MeasuredLine<TTextExtraData>,
    nextHiddenLine: MeasuredLine<TTextExtraData>,
    containerWidth: number,
  ): MeasuredLine<TTextExtraData> {
    const ellipsisMeasuredFragment = this.createMeasuredTextFragment(
      '…',
      lastVisibleLine,
    );
    const spaceMeasuredFragment = this.createMeasuredTextFragment(
      ' ',
      lastVisibleLine,
    );
    if (!ellipsisMeasuredFragment) return lastVisibleLine;
    const availableWidth = containerWidth - lastVisibleLine.size.width;
    if (ellipsisMeasuredFragment.size.width <= availableWidth) {
      if (nextHiddenLine.positionedFragments.length > 0) {
        if (spaceMeasuredFragment) {
          lastVisibleLine = this.insertMeasuredTextFragmentIntoLine(
            spaceMeasuredFragment,
            lastVisibleLine,
          );
        }
        lastVisibleLine = this.insertMeasuredTextFragmentIntoLine(
          nextHiddenLine.positionedFragments[0],
          lastVisibleLine,
        );
      }
      const trimmedLastVisibleLine = this.trimLine(
        lastVisibleLine,
        containerWidth - ellipsisMeasuredFragment.size.width,
      );
      if (!trimmedLastVisibleLine) return lastVisibleLine;
      return this.insertEllipsisIntoLine(
        ellipsisMeasuredFragment,
        trimmedLastVisibleLine,
      );
    } else {
      const trimmedLastVisibleLine = this.trimLine(
        lastVisibleLine,
        containerWidth - ellipsisMeasuredFragment.size.width,
      );
      if (!trimmedLastVisibleLine) return lastVisibleLine;
      return this.insertEllipsisIntoLine(
        ellipsisMeasuredFragment,
        trimmedLastVisibleLine,
      );
    }
  }

  private createMeasuredTextFragment(
    textContent: string,
    lastVisibleLine: MeasuredLine<TTextExtraData>,
  ): MeasuredFragment<TTextExtraData> | null {
    const lastPositionedTextFragment = lastVisibleLine.positionedFragments
      .slice()
      .reverse()
      .find(positionedFragment => positionedFragment.fragment.type === 'text');
    if (!lastPositionedTextFragment) return null;
    const lastTextFragment =
      lastPositionedTextFragment.fragment as TextFragment<TTextExtraData>;
    const ellipsisTextFragment: TextFragment<TTextExtraData> = {
      type: 'text',
      content: textContent,
      extraData: lastTextFragment.extraData,
    };

    const size =
      this.textFragmentMeasurer.measureTextFragment(ellipsisTextFragment);
    return {
      size: size,
      fragment: ellipsisTextFragment,
    };
  }

  private insertMeasuredTextFragmentIntoLine(
    measuredTextFragment: MeasuredFragment<TTextExtraData>,
    line: MeasuredLine<TTextExtraData>,
  ): MeasuredLine<TTextExtraData> {
    if (measuredTextFragment.fragment.type !== 'text') {
      return line;
    }
    let lastPositionedFragmentPositionRelativeToLine: Position = {x: 0, y: 0};
    let lastPositionedFragmentSize: Size = {width: 0, height: 0};
    if (line.positionedFragments.length > 0) {
      const lastPositionedFragment =
        line.positionedFragments[line.positionedFragments.length - 1];
      lastPositionedFragmentPositionRelativeToLine =
        lastPositionedFragment.positionRelativeToLine;
      lastPositionedFragmentSize = lastPositionedFragment.size;
    }
    return {
      positionedFragments: [
        ...line.positionedFragments,
        {
          ...measuredTextFragment,
          positionRelativeToLine: {
            x:
              lastPositionedFragmentPositionRelativeToLine.x +
              lastPositionedFragmentSize.width,
            y: lastPositionedFragmentPositionRelativeToLine.y,
          },
        },
      ],
      size: {
        width: line.size.width + measuredTextFragment.size.width,
        height: line.size.height,
      },
    };
  }

  private trimLine(
    line: MeasuredLine<TTextExtraData>,
    maxWidth: number,
  ): MeasuredLine<TTextExtraData> | null {
    if (line.positionedFragments.length === 0) return line;
    const lastPositionedTextFragment =
      line.positionedFragments[line.positionedFragments.length - 1];
    const lineWidthWithoutLastFragment =
      line.size.width - lastPositionedTextFragment.size.width;
    if (lastPositionedTextFragment.fragment.type === 'text') {
      const content = lastPositionedTextFragment.fragment.content;
      let lastFittingMeasuredTextFragment: MeasuredFragment<TTextExtraData> | null =
        null;
      for (let i = 1; i <= content.length; i++) {
        const textFragment: TextFragment<TTextExtraData> = {
          type: 'text',
          content: content.slice(0, i),
          extraData: lastPositionedTextFragment.fragment.extraData,
        };
        const size =
          this.textFragmentMeasurer.measureTextFragment(textFragment);
        if (lineWidthWithoutLastFragment + size.width > maxWidth) {
          if (!lastFittingMeasuredTextFragment) return null;
          const newPositionedFragments = [
            ...line.positionedFragments.slice(0, -1),
            {
              ...lastFittingMeasuredTextFragment,
              positionRelativeToLine:
                lastPositionedTextFragment.positionRelativeToLine,
            },
          ];
          return {
            positionedFragments: newPositionedFragments,
            size: {
              width: newPositionedFragments.reduce(
                (totalWidth, pf) => totalWidth + pf.size.width,
                0,
              ),
              height: line.size.height,
            },
          };
        }
        lastFittingMeasuredTextFragment = {fragment: textFragment, size};
      }
    }
    return null;
  }

  private insertEllipsisIntoLine(
    ellipsisMeasuredFragment: MeasuredFragment<TTextExtraData>,
    line: MeasuredLine<TTextExtraData>,
  ): MeasuredLine<TTextExtraData> {
    if (line.positionedFragments.length === 0) return line;
    const lastPositionedFragment =
      line.positionedFragments[line.positionedFragments.length - 1];

    return {
      positionedFragments: [
        ...line.positionedFragments,
        {
          ...ellipsisMeasuredFragment,
          positionRelativeToLine: {
            x:
              lastPositionedFragment.positionRelativeToLine.x +
              lastPositionedFragment.size.width,
            y: lastPositionedFragment.positionRelativeToLine.y,
          },
        },
      ],
      size: {
        width: line.size.width + ellipsisMeasuredFragment.size.width,
        height: line.size.height,
      },
    };
  }
}
