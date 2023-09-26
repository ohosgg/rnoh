export type Size = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export type TextFragment<TExtraData extends Record<string, any> = any> = {
  type: 'text';
  content: string;
  extraData: TExtraData;
};

export type PlaceholderFragment = {
  type: 'placeholder';
  width: number;
  height: number;
};

export type Fragment<TTextExtraData extends Record<string, any> = any> =
  | TextFragment<TTextExtraData>
  | PlaceholderFragment;

export type MeasuredFragment<
  TTextExtraData extends Record<string, any> = any,
  TFragment extends Fragment<TTextExtraData> = Fragment<TTextExtraData>,
> = {
  fragment: TFragment;
  size: Size;
};

export type PositionedFragment<
  TTextExtraData extends Record<string, any> = any,
> = MeasuredFragment<TTextExtraData> & {
  positionRelativeToLine: Position;
};

export type MeasuredLine<TTextExtraData extends Record<string, any> = any> = {
  positionedFragments: PositionedFragment<TTextExtraData>[];
  size: Size;
};

export type ContainerConfig = {
  width?: number;
};

export interface WordWrapStrategy {
  convertFragmentsIntoLines<TTextExtraData extends Record<string, any> = any>(
    fragments: Fragment<any>[],
    containerConfig: ContainerConfig,
  ): MeasuredLine<TTextExtraData>[];
}

export type ParagraphConfig = {
  maxLinesCount: number;
  wordWrapStrategy: WordWrapStrategy;
};

export type Paragraph<TTextExtraData extends Record<string, any> = any> = {
  fragments: Fragment<TTextExtraData>[];
};

export type PositionedLine<TTextExtraData extends Record<string, any> = any> =
  MeasuredLine<TTextExtraData> & {
    positionRelativeToParagraph: Position;
  };

export type MeasuredParagraph<
  TTextExtraData extends Record<string, any> = any,
> = {
  positionedLines: PositionedLine<TTextExtraData>[];
  size: Size;
};

export interface TextFragmentMeasurer<
  TTextExtraData extends Record<string, any>,
> {
  measureTextFragment(textFragment: TextFragment<TTextExtraData>): Size;
}
