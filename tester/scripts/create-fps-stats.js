const {createFpsStats} = require('./lib/create-fps-stats');

let inputData = '';

process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  const frameTimes = JSON.parse(inputData);

  const result = createFpsStats(frameTimes);

  frameTimes.forEach(frameTime => {
    console.log(frameTime);
  });
  console.log('');
  console.log('========= FPS stats =========');
  console.log('mean                      :', result.mean.toFixed(1), 'FPS');
  console.log(
    'standard deviation        :',
    result.standardDeviationInFps.toFixed(1),
    'FPS',
  );
  console.log(
    '95th frame time percentile:',
    result.frameTime95thPercentileInFps.toFixed(1),
    'FPS',
  );
  console.log(
    '99th frame time percentile:',
    result.frameTime99thPercentileInFps.toFixed(1),
    'FPS',
  );
});
