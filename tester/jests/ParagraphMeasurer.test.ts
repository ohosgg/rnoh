import {
  MeasuredLine,
  ParagraphMeasurer,
  Size,
  TextFragment,
  TextFragmentMeasurer,
  UnhyphenatedWordWrapStrategy,
} from '../harmony/rnoh/src/main/ets/ParagraphMeasurer';

class FakeTextFragmentMeasurer implements TextFragmentMeasurer {
  measureTextFragment(textFragment: TextFragment): Size {
    return {
      width: textFragment.content.length,
      height: 1,
    };
  }
}

function createParagraphMeasurer() {
  return new ParagraphMeasurer();
}

let result: any;

beforeEach(() => {
  result = undefined;
});

afterEach(() => {
  if (expect.getState().assertionCalls != expect.getState().numPassingAsserts)
    console.log(JSON.stringify(result, null, 2));
});

describe('ParagraphMeasurer', () => {
  it('should split textContent correctly', () => {
    const paragraphMeasurer = createParagraphMeasurer();
    const textContent =
      'Aute reprehenderit amet deserunt enim laborum ad excepteur cillum.';
    const containerWidth = 16;
    const textFragment: TextFragment = {
      type: 'text',
      content: textContent,
      fontSize: 1,
      lineHeight: 16,
      fontWeight: undefined,
      letterSpacing: undefined,
    };

    const result = paragraphMeasurer.measureParagraph(
      {fragments: [textFragment]},
      {
        wordWrapStrategy: new UnhyphenatedWordWrapStrategy(
          new FakeTextFragmentMeasurer(),
        ),
        containerConfig: {width: containerWidth},
      },
    );

    expect(result.size.width).toBe(containerWidth);
    expectLineSplitting(result.measuredLines, [
      ['Aute'],
      ['reprehenderit'],
      ['amet deserunt'],
      ['enim laborum ad'],
      ['excepteur'],
      ['cillum.'],
    ]);
  });
});

function expectLineSplitting(
  measuredLines: MeasuredLine[],
  expectedLineContents: string[][],
) {
  const actualLineContents = measuredLines.map(measuredLine => {
    const fragmentContents: string[] = [];
    for (const positionedFragment of measuredLine.positionedFragments) {
      if (positionedFragment.fragment.type === 'text') {
        fragmentContents.push(positionedFragment.fragment.content);
      }
    }
    return fragmentContents;
  });
  expect(actualLineContents).toStrictEqual(expectedLineContents);
}

describe('UnhyphenatedWordWrapStrategy', () => {
  it('should handle a single word in a single line', () => {
    const strategy = new UnhyphenatedWordWrapStrategy(
      new FakeTextFragmentMeasurer(),
    );
    const LINE_HEIGHT = 1;
    const TEXT = 'foobar';

    const lines = strategy.convertFragmentsIntoLines(
      [
        {
          type: 'text',
          content: TEXT,
          fontSize: 0,
          lineHeight: LINE_HEIGHT,
          fontWeight: undefined,
          letterSpacing: undefined,
        },
      ],
      {width: undefined},
    );

    expect(lines.length).toBe(1);
    expect(lines[0].positionedFragments.length).toBe(1);
    expect(lines[0].positionedFragments[0].size.height).toBe(LINE_HEIGHT);
    expect(lines[0].positionedFragments[0].size.width).toBe(TEXT.length);
  });

  it('should handle two words in a single line', () => {
    const strategy = new UnhyphenatedWordWrapStrategy(
      new FakeTextFragmentMeasurer(),
    );
    const LINE_HEIGHT = 1;
    const TEXT = 'foo bar';

    const lines = strategy.convertFragmentsIntoLines(
      [
        {
          type: 'text',
          content: TEXT,
          fontSize: 0,
          lineHeight: LINE_HEIGHT,
          fontWeight: undefined,
          letterSpacing: undefined,
        },
      ],
      {width: undefined},
    );

    expect(lines.length).toBe(1);
    expect(lines[0].positionedFragments.length).toBe(1);
    expect(lines[0].positionedFragments[0].size.height).toBe(LINE_HEIGHT);
    expect(lines[0].positionedFragments[0].size.width).toBe(TEXT.length);
  });

  it('should handle two words in two lines', () => {
    const strategy = new UnhyphenatedWordWrapStrategy(
      new FakeTextFragmentMeasurer(),
    );
    const LINE_HEIGHT = 1;
    const TEXT = 'foo bar';

    result = strategy.convertFragmentsIntoLines(
      [
        {
          type: 'text',
          content: TEXT,
          fontSize: 0,
          lineHeight: LINE_HEIGHT,
          fontWeight: undefined,
          letterSpacing: undefined,
        },
      ],
      {width: 4},
    );

    expect(result.length).toBe(2);
    expect(result[0].positionedFragments.length).toBe(1);
    expect(result[0].positionedFragments[0].size.width).toBe('foo'.length);
    expect(result[1].positionedFragments.length).toBe(1);
    expect(result[1].positionedFragments[0].size.width).toBe('bar'.length);
  });

  it('should support \\n', () => {
    const strategy = new UnhyphenatedWordWrapStrategy(
      new FakeTextFragmentMeasurer(),
    );
    const LINE_HEIGHT = 1;
    const TEXT = 'foo\nbar\\nbaz';

    result = strategy.convertFragmentsIntoLines(
      [
        {
          type: 'text',
          content: TEXT,
          fontSize: 0,
          lineHeight: LINE_HEIGHT,
          fontWeight: undefined,
          letterSpacing: undefined,
        },
      ],
      {width: undefined},
    );

    expect(result.length).toBe(2);
    expect(result[0].positionedFragments.length).toBe(1);
    expect(result[0].positionedFragments[0].size.width).toBe('foo'.length);
    expect(result[1].positionedFragments.length).toBe(1);
    expect(result[1].positionedFragments[0].size.width).toBe(
      'bar\\nbaz'.length,
    );
  });

  it('should preserve spaces', () => {
    const strategy = new UnhyphenatedWordWrapStrategy(
      new FakeTextFragmentMeasurer(),
    );
    const LINE_HEIGHT = 1;
    const TEXT = ' foo bar ';

    result = strategy.convertFragmentsIntoLines(
      [
        {
          type: 'text',
          content: TEXT,
          fontSize: 0,
          lineHeight: LINE_HEIGHT,
          fontWeight: undefined,
          letterSpacing: undefined,
        },
      ],
      {width: 4},
    );

    const lines = result;
    expect(lines.length).toBe(2);
    expect(lines[0].positionedFragments.length).toBe(1);
    expect(lines[0].positionedFragments[0].size.width).toBe(' foo'.length);
    expect(lines[1].positionedFragments.length).toBe(1);
    expect(lines[1].positionedFragments[0].size.width).toBe('bar '.length);
  });
});
