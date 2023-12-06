const yargs = require('yargs');
const argv = yargs
  .option('dt', {
    alias: 'd',
    type: 'number',
    default: 0.5,
    description:
      'Set the timestep value (in seconds) with which FPS samples are calculated' +
      ' (if the timestep is 0.5 seconds, and the frame times have been' +
      ' collected for 10 seconds, there will be 20 FPS samples equally spaced in time) ',
  })
  .help('h')
  .example(
    '$0 -dt 0.3',
    'creates the performance report from the input frame times in stdin.',
  )
  .alias('h', 'help').argv;

const calculateFps = (frameTimes, dt) => {
  const timeSum = frameTimes.reduce((sum, fps) => sum + fps, 0);
  let currentFrameTimeSum = 0;
  let frameIndex = 0;
  let fpsArray = [];

  for (
    let currentSampleTime = dt;
    currentSampleTime < timeSum;
    currentSampleTime += dt
  ) {
    let currentFrameTimes = [];

    while (
      currentFrameTimeSum + frameTimes[frameIndex + 1] < currentSampleTime &&
      frameIndex < frameTimes.length
    ) {
      currentFrameTimeSum = currentFrameTimeSum + frameTimes[frameIndex + 1];
      currentFrameTimes.push(frameTimes[frameIndex + 1]);
      frameIndex++;
    }

    if (currentFrameTimes.length === 0) {
      fpsArray.push(1 / frameTimes[frameIndex + 1]);
    } else {
      fpsArray.push(
        1 /
          (currentFrameTimes.reduce((prev, curr) => prev + curr, 0) /
            currentFrameTimes.length),
      );
    }
  }

  const averageFps =
    fpsArray.reduce((sum, fps) => sum + fps, 0) / fpsArray.length;

  const sortedFps = [...fpsArray].sort((a, b) => a - b);
  const percentile95Fps = sortedFps[Math.floor(fpsArray.length * 0.05)];
  const percentile99Fps = sortedFps[Math.floor(fpsArray.length * 0.01)];

  return {
    fpsArray: fpsArray,
    averageFps: averageFps,
    percentile95Fps: percentile95Fps,
    percentile99Fps: percentile99Fps,
    dt: dt,
  };
};

let inputData = '';

process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  const frameTimes = JSON.parse(inputData);
  const result = calculateFps(frameTimes, argv.dt);
  console.log(JSON.stringify(result, null, 2));
});
