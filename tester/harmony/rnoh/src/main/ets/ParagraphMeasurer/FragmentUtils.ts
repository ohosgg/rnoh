import {MeasuredFragment, PositionedFragment} from './types';
import {ParagraphMeasurerError} from './Error';

export function convertMeasuredFragmentsToPositionedFragments(
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

export function reduceMeasuredFragments(
  tokens: MeasuredFragment[],
): MeasuredFragment[] {
  if (tokens.length === 0) return [];
  if (tokens.length === 1) return tokens;
  const results: MeasuredFragment[] = [];
  let lhs = tokens[0];
  for (const rhs of tokens.slice(1)) {
    if (canMeasuredFragmentsBeJoined(lhs, rhs)) {
      lhs = joinFragments(lhs, rhs);
    } else {
      results.push(lhs);
      lhs = rhs;
    }
  }
  results.push(lhs);
  return results;
}

function canMeasuredFragmentsBeJoined(
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

function joinFragments(
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
