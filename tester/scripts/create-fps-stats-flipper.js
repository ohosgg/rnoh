const csv = require('csv-parser');
const fs = require('fs');
const ss = require('simple-statistics');
const {generateFPSStatsConsoleOutput} = require('./lib/create-fps-stats');

let files = process.argv.slice(2);
let allStats = [];

const calculateFPS = filename => {
  return new Promise((resolve, reject) => {
    let fpsArr = []; // moved inside the function to reset for each file
    fs.createReadStream(filename)
      .pipe(csv())
      .on('data', row => fpsArr.push(parseFloat(row['UI FPS'])))
      .on('end', () => {
        console.log(`Processed file ${filename}`);
        const fpsStats = {
          mean: ss.mean(fpsArr),
          standardDeviationInFps: ss.standardDeviation(fpsArr),
          frameTime95thPercentileInFps: ss.quantileSorted(fpsArr, 0.05),
          frameTime99thPercentileInFps: ss.quantileSorted(fpsArr, 0.01),
        };
        allStats.push(fpsStats);
        resolve();
      })
      .on('error', reject);
  });
};

Promise.all(files.map(calculateFPS))
  .then(() => {
    // Calculate the average and standard deviation for each statistic from all files
    const averageFpsStats = {
      mean: ss.mean(allStats.map(s => s.mean)),
      standardDeviationInFps: ss.mean(
        allStats.map(s => s.standardDeviationInFps),
      ),
      frameTime95thPercentileInFps: ss.mean(
        allStats.map(s => s.frameTime95thPercentileInFps),
      ),
      frameTime99thPercentileInFps: ss.mean(
        allStats.map(s => s.frameTime99thPercentileInFps),
      ),
    };

    console.log(generateFPSStatsConsoleOutput(averageFpsStats));
  })
  .catch(err => console.error(`Failed to process files: ${err}`));
