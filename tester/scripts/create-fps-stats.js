const {
  createFpsStats,
  generateFPSStatsConsoleOutput,
} = require('./lib/create-fps-stats');

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
  console.log(generateFPSStatsConsoleOutput(result));
});
