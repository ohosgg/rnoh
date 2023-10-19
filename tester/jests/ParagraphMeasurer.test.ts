import {
  MeasuredLine,
  ParagraphMeasurer,
  Size,
  TextFragment,
  TextFragmentMeasurer,
  UnhyphenatedWordWrapStrategy,
  TailEllipsisInserter,
} from '../harmony/rnoh/src/main/ets/ParagraphMeasurer';

type ExtraData = {
  fontSize?: number;
  lineHeight?: number;
};

class FakeTextFragmentMeasurer implements TextFragmentMeasurer<ExtraData> {
  measureTextFragment(textFragment: TextFragment<ExtraData>): Size {
    return {
      width: textFragment.content.length,
      height:
        textFragment.extraData.lineHeight ??
        textFragment.extraData.fontSize ??
        1,
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
      extraData: {},
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

    expect(result.size.width).toBe('enim laborum ad'.length);
    expectLineSplitting(result.positionedLines, [
      ['Aute'],
      ['reprehenderit'],
      ['amet deserunt'],
      ['enim laborum ad'],
      ['excepteur'],
      ['cillum.'],
    ]);
  });

  it('should return 2 lines', () => {
    const paragraphMeasurer = createParagraphMeasurer();
    const textFragmentMeasurer = new FakeTextFragmentMeasurer();

    const result = paragraphMeasurer.measureParagraph(
      {
        fragments: [
          {
            type: 'text',
            content:
              'Aute reprehenderit amet deserunt enim laborum ad excepteur cillum.',
            extraData: {},
          },
        ],
      },
      {
        wordWrapStrategy: new UnhyphenatedWordWrapStrategy(
          textFragmentMeasurer,
        ),
        containerConfig: {width: 16, maxNumberOfLines: 2},
        ellipsisInserter: new TailEllipsisInserter(textFragmentMeasurer),
      },
    );

    expect(result.positionedLines.length).toBe(2);
    expectLineSplitting(result.positionedLines, [
      ['Aute'],
      ['reprehenderit', '…'],
    ]);
  });

  describe('horizontalAlignment', () => {
    it('should center the text', () => {
      const paragraphMeasurer = createParagraphMeasurer();

      const result = paragraphMeasurer.measureParagraph(
        {fragments: [{type: 'text', content: 'foo', extraData: {}}]},
        {
          wordWrapStrategy: new UnhyphenatedWordWrapStrategy(
            new FakeTextFragmentMeasurer(),
          ),
          containerConfig: {width: 5, horizontalAlignment: 'center'},
        },
      );

      expect(
        result.positionedLines[0].positionedFragments[0].positionRelativeToLine
          .x,
      ).toBe(1);
    });

    it('should align the text to the end', () => {
      const paragraphMeasurer = createParagraphMeasurer();

      const result = paragraphMeasurer.measureParagraph(
        {fragments: [{type: 'text', content: 'foo', extraData: {}}]},
        {
          wordWrapStrategy: new UnhyphenatedWordWrapStrategy(
            new FakeTextFragmentMeasurer(),
          ),
          containerConfig: {width: 5, horizontalAlignment: 'end'},
        },
      );

      expect(
        result.positionedLines[0].positionedFragments[0].positionRelativeToLine
          .x,
      ).toBe(2);
    });
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
          extraData: {},
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
          extraData: {
            lineHeight: LINE_HEIGHT,
          },
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
    const TEXT = 'foo bar';

    result = strategy.convertFragmentsIntoLines(
      [
        {
          type: 'text',
          content: TEXT,
          extraData: {},
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
    const TEXT = 'foo\nbar\\nbaz';

    result = strategy.convertFragmentsIntoLines(
      [
        {
          type: 'text',
          content: TEXT,
          extraData: {},
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
    const TEXT = ' foo bar ';

    result = strategy.convertFragmentsIntoLines(
      [
        {
          type: 'text',
          content: TEXT,
          extraData: {},
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

  it('should wrap text with a placeholder', () => {
    const strategy = new UnhyphenatedWordWrapStrategy(
      new FakeTextFragmentMeasurer(),
    );

    const lines = strategy.convertFragmentsIntoLines(
      [
        {type: 'placeholder', width: 4, height: 4, extraData: {}},
        {type: 'text', content: '12345678', extraData: {}},
      ],
      {width: 10},
    );
    result = lines;

    expect(lines.length).toBe(2);
    expect(lines[0].positionedFragments[0].fragment.type).toBe('placeholder');
    expect(lines[0].size.width).toBe(4);
    expect(lines[1].size.width).toBe(8);
  });
});

describe('TailEllipsisInserter', () => {
  it("should insert '…'", () => {
    const ellipsisInserter = new TailEllipsisInserter(
      new FakeTextFragmentMeasurer(),
    );

    const newLastLine = ellipsisInserter.insertEllipsis(
      {
        positionedFragments: [
          {
            fragment: {type: 'text', content: 'foo', extraData: {}},
            positionRelativeToLine: {x: 0, y: 0},
            size: {width: 3, height: 1},
          },
        ],
        size: {width: 3, height: 1},
      },
      {
        positionedFragments: [
          {
            fragment: {type: 'text', content: 'barbar', extraData: {}},
            positionRelativeToLine: {x: 0, y: 0},
            size: {width: 6, height: 1},
          },
        ],
        size: {width: 6, height: 1},
      },
      6,
    );

    expect(newLastLine.positionedFragments.length).toBe(2);
    expectLineSplitting([newLastLine], [['foo', '…']]);
  });

  it("should insert '…' if there's available enough space", () => {
    const ellipsisInserter = new TailEllipsisInserter(
      new FakeTextFragmentMeasurer(),
    );

    const newLastLine = ellipsisInserter.insertEllipsis(
      {
        positionedFragments: [
          {
            fragment: {type: 'text', content: 'foo', extraData: {}},
            positionRelativeToLine: {x: 0, y: 0},
            size: {width: 3, height: 1},
          },
        ],
        size: {width: 3, height: 1},
      },
      {
        positionedFragments: [
          {
            fragment: {type: 'text', content: 'barbar', extraData: {}},
            positionRelativeToLine: {x: 0, y: 0},
            size: {width: 6, height: 1},
          },
        ],
        size: {width: 6, height: 1},
      },
      6,
    );

    expect(newLastLine.positionedFragments.length).toBe(2);
    expectLineSplitting([newLastLine], [['foo', '…']]);
  });

  it('should trim last world to give a space for …', () => {
    const ellipsisInserter = new TailEllipsisInserter(
      new FakeTextFragmentMeasurer(),
    );

    const newLastLine = ellipsisInserter.insertEllipsis(
      {
        positionedFragments: [
          {
            fragment: {type: 'text', content: 'foo', extraData: {}},
            positionRelativeToLine: {x: 0, y: 0},
            size: {width: 3, height: 1},
          },
        ],
        size: {width: 3, height: 1},
      },
      {
        positionedFragments: [
          {
            fragment: {type: 'text', content: 'barbar', extraData: {}},
            positionRelativeToLine: {x: 0, y: 0},
            size: {width: 6, height: 1},
          },
        ],
        size: {width: 6, height: 1},
      },
      3,
    );

    expect(newLastLine.positionedFragments.length).toBe(2);
    expectLineSplitting([newLastLine], [['fo', '…']]);
  });
});
