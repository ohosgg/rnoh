// @ts-check

const {createFpsStats} = require('./create-fps-stats');

it('should calculate mean when frame times are 1/60 sec', () => {
  const stats = createFpsStats([1 / 60, 1 / 60]);

  expect(stats).not.toBeNull();
  expect(stats?.mean).toBeCloseTo(60);
});

it('should respect the fact that 60 fps produces twice as much frame times than 30 fps', () => {
  const stats = createFpsStats([1 / 30, 1 / 60, 1 / 60]);

  expect(stats).not.toBeNull();
  expect(stats?.mean).toBeCloseTo(45);
});

it('should calculate 95th and 99th percentile correctly', () => {
  const stats = createFpsStats([
    ...generateFrameTimes({durationInSec: 9.5, fps: 60}),
    ...generateFrameTimes({durationInSec: 0.4, fps: 30}),
    ...generateFrameTimes({durationInSec: 0.1, fps: 10}),
  ]);

  expect(stats).not.toBeNull();
  expect(stats?.frameTime95thPercentileInFps).toBe(30);
  expect(stats?.frameTime99thPercentileInFps).toBe(10);
});

it('should calculate standard deviation stat', () => {
  const stats = createFpsStats([1 / 55, 1 / 60, 1 / 65]);

  expect(stats?.standardDeviationInFps).toBeCloseTo(4.08);
});

/**
 * @param {{durationInSec: number, fps: number}} config
 */
function generateFrameTimes(config) {
  return new Array(Math.floor(config.durationInSec * config.fps)).fill(
    1 / config.fps,
  );
}
