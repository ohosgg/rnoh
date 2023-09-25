export type Size = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export type TextFragment = {
  type: 'text';
  content: string;
  fontSize: number;
  lineHeight: number | undefined;
  fontWeight: number | undefined;
  letterSpacing: number | undefined
};

export type PlaceholderFragment = {
  type: 'placeholder';
  width: number;
  height: number;
};

export type Fragment = TextFragment | PlaceholderFragment;

export type MeasuredFragment<TFragment extends Fragment = Fragment> = {
  fragment: TFragment;
  size: Size;
};

export type PositionedFragment = MeasuredFragment & {
  positionRelativeToLine: Position;
};

export type MeasuredLine = {
  positionedFragments: PositionedFragment[];
  size: Size;
};

export type ContainerConfig = {
  width?: number;
};

export interface WordWrapStrategy {
  convertFragmentsIntoLines(
    fragments: Fragment[],
    containerConfig: ContainerConfig
  ): MeasuredLine[];
}

export type ParagraphConfig = {
  maxLinesCount: number;
  wordWrapStrategy: WordWrapStrategy;
};

export type Paragraph = {
  fragments: Fragment[];
};

export type MeasuredParagraph = {
  measuredLines: MeasuredLine[];
  size: Size;
};

export interface TextFragmentMeasurer {
  measureTextFragment(textFragment: TextFragment): Size;
}
