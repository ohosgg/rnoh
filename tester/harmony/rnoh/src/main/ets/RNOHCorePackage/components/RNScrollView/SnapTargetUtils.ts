import { ScrollOffset } from "./types"


export type CalculateSnapTargetParams = {
  currentOffset: ScrollOffset,
  isPagingEnabled: boolean | undefined,
  offsets: number[] | undefined,
  interval: number | undefined,
  isHorizontalScroll: boolean,
  container: {
    width: number,
    height: number
  },
  content: {
    width: number,
    height: number
  },
  recentDimOffsetDelta: number
}

export function calculateSnapTarget({
                                      currentOffset,
                                      isPagingEnabled,
                                      offsets,
                                      interval,
                                      isHorizontalScroll,
                                      container,
                                      content,
                                      recentDimOffsetDelta
                                    }: CalculateSnapTargetParams): ScrollOffset | undefined {
  if (isPagingEnabled) {
    return calculateNewOffsetInActiveScrollDirection(
      (currentDimOffset) => calculatePageSnapTarget(currentDimOffset,
        isHorizontalScroll ? container.width : container.height,
        recentDimOffsetDelta,
      ), currentOffset, isHorizontalScroll)
  } else if (offsets && offsets.length > 0) {
    return calculateNewOffsetInActiveScrollDirection(
      (currentDimOffset) => pickSnapTargetFromOffsets(currentDimOffset, recentDimOffsetDelta, offsets),
      currentOffset, isHorizontalScroll)
  } else if (interval) {
    return calculateNewOffsetInActiveScrollDirection((currentDimOffset) =>
    calculateSnapTargetFromIntervals(
      currentDimOffset,
      recentDimOffsetDelta,
      interval,
      isHorizontalScroll ? content.width : content.height
    ), currentOffset, isHorizontalScroll)
  }
  return null
}

function calculateNewOffsetInActiveScrollDirection(mapFn: (currentDimOffset: number) => number, currentOffset: ScrollOffset, isHorizontalScroll: boolean): ScrollOffset {
  if (isHorizontalScroll) {
    return { xOffset: mapFn(currentOffset.xOffset), yOffset: currentOffset.yOffset }
  } else {
    return { xOffset: currentOffset.xOffset, yOffset: mapFn(currentOffset.yOffset) }
  }
}

function calculatePageSnapTarget(currentDimOffset: number, pageLength: number, dimOffsetDelta: number): number {
  const op = dimOffsetDelta < 0 ? Math.floor : Math.ceil;
  return op(currentDimOffset / pageLength) * pageLength
}

function pickSnapTargetFromOffsets(currentDimOffset: number, recentDimOffsetDelta: number, dimOffsets: number[]): number | null {
  const sortedDimOffsets = [...dimOffsets]
  sortedDimOffsets.sort((lhs, rhs) => lhs - rhs)
  if (recentDimOffsetDelta > 0) {
    for (const dimOffset of sortedDimOffsets) {
      if (dimOffset > currentDimOffset) {
        return dimOffset
      }
    }
    return null
  } else {
    sortedDimOffsets.reverse()
    for (const dimOffset of sortedDimOffsets) {
      if (dimOffset < currentDimOffset) {
        return dimOffset
      }
    }
    return null
  }
  return 0;
}

function calculateSnapTargetFromIntervals(currentDimOffset: number, recentDimOffsetDelta: number, intervalLength: number, dimLength: number): number | null {
  const offsets: number[] = []
  for (let i = 0; i * intervalLength < dimLength; i++) {
    offsets.push(i * intervalLength)
  }
  return pickSnapTargetFromOffsets(currentDimOffset, recentDimOffsetDelta, offsets)
}
