// @ts-check

/**
 * @param {number[]} frameTimesInSec
 */
function createFpsStats(frameTimesInSec) {
  const sampleSize = frameTimesInSec.length;
  if (sampleSize === 0) {
    return null;
  }
  // treat frame times that took longer than seconds as outliers
  const filteredFrameTimesInSec = frameTimesInSec.filter(
    frameTimeInSec => frameTimeInSec < 1,
  );

  return {
    mean: calculateAverageFps(filteredFrameTimesInSec),
    standardDeviationInFps: calculateStandardDeviation(
      filteredFrameTimesInSec.map(ft => 1 / ft),
    ),
    frameTime95thPercentileInFps: convertFrameTimeToFPS(
      calculateFrameTimesPercentile(filteredFrameTimesInSec, 95),
    ),
    frameTime99thPercentileInFps: convertFrameTimeToFPS(
      calculateFrameTimesPercentile(filteredFrameTimesInSec, 99),
    ),
  };
}

/**
 * @param {number[]} frameTimesInSec
 */
function calculateAverageFps(frameTimesInSec) {
  return convertFrameTimeToFPS(sum(frameTimesInSec) / frameTimesInSec.length);
}

/**
 * @param {number[]} values
 */
function calculateStandardDeviation(values) {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n,
  );
}

/**
 * @param {Object} fpsStats
 * @param {number} fpsStats.mean
 * @param {number} fpsStats.standardDeviationInFps
 * @param {number} fpsStats.frameTime95thPercentileInFps
 * @param {number} fpsStats.frameTime99thPercentileInFps
 */
function generateFPSStatsConsoleOutput(fpsStats) {
  return (
    '\n' +
    '========= FPS stats =========\n' +
    'mean                      : ' +
    fpsStats.mean.toFixed(1) +
    ' FPS\n' +
    'standard deviation        : ' +
    fpsStats.standardDeviationInFps.toFixed(1) +
    ' FPS\n' +
    '95th frame time percentile: ' +
    fpsStats.frameTime95thPercentileInFps.toFixed(1) +
    ' FPS\n' +
    '99th frame time percentile: ' +
    fpsStats.frameTime99thPercentileInFps.toFixed(1) +
    ' FPS\n'
  );
}

/**
 * @param {number[]} values
 */
function sum(values) {
  return values.reduce((acc, value) => acc + value, 0);
}

/**
 * @param {number} frameTimeInSec
 */
function convertFrameTimeToFPS(frameTimeInSec) {
  return 1 / frameTimeInSec;
}

/**
 * @param{number[]} frameTimesInSec
 * @param{number} percentile
 */
function calculateFrameTimesPercentile(frameTimesInSec, percentile) {
  const sortedFrameTimesInSec = [...frameTimesInSec].sort((a, b) => a - b);
  const totalTimeInSec = sum(frameTimesInSec);

  let currentFrameTimesInSecSum = 0;
  let currentIdx = 0;
  while (
    currentFrameTimesInSecSum < totalTimeInSec * (percentile / 100) &&
    currentIdx < sortedFrameTimesInSec.length - 1
  ) {
    currentFrameTimesInSecSum += sortedFrameTimesInSec[currentIdx];
    currentIdx++;
  }
  return sortedFrameTimesInSec[currentIdx];
}

module.exports = {createFpsStats, generateFPSStatsConsoleOutput};
