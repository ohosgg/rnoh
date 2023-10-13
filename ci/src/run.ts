import { join } from 'path';
import { lintEts } from './lintEts';
import { dots6 } from 'cli-spinners';
import { CIFail } from './error';
const clc = require('cli-color');

const CWD = process.cwd();
const SCRIPT_DIR_PATH = import.meta.dir;
const MODULE_ROOT_PATH = join(SCRIPT_DIR_PATH, '..');
const PROJECT_ROOT_PATH = join(MODULE_ROOT_PATH, '..');
const DATA_PATH = join(MODULE_ROOT_PATH, 'data');

await (async function run() {
  const activity = new Activity();
  try {
    await runETSLint(activity);
  } catch (err) {
    activity.stop();
    if (err instanceof CIFail) {
      console.error(err.message);
      process.exit(1);
    } else {
      throw err;
    }
  }
})();

async function runETSLint(activity: Activity) {
  activity.start('Linting ETS');
  const result = await lintEts({
    cwd: CWD,
    lintingEtsResultPath: join(DATA_PATH, 'lintingEtsResult.json'),
    tmpDirPath: join(MODULE_ROOT_PATH, 'tmp'),
    testerDirPath: join(PROJECT_ROOT_PATH, 'tester'),
  });
  activity.stop();
  console.log('Linting ETS results:');
  console.log(JSON.stringify(result.issuesCountByType, null, 2));
  console.log(
    `  migration warnings: ${
      result.migrationWarningsCount > 0
        ? YELLOW(result.migrationWarningsCount)
        : GREEN(result.migrationWarningsCount)
    }`
  );
  console.log(
    `  warnings: ${
      result.warningsCount > 0
        ? YELLOW(result.warningsCount)
        : GREEN(result.warningsCount)
    }`
  );
  console.log(
    `  errors: ${
      result.errorsCount > 0
        ? RED(result.errorsCount)
        : GREEN(result.errorsCount)
    }`
  );
}

class Activity {
  private interval: any;

  start(name: string) {
    let spinnerFrameIdx = 0;
    this.interval = setInterval(() => {
      process.stdout.write(`\r${dots6.frames[spinnerFrameIdx]} ${name}`);
      spinnerFrameIdx = (spinnerFrameIdx + 1) % dots6.frames.length;
    }, dots6.interval);
  }

  stop() {
    process.stdout.write(`\r`);
    clearInterval(this.interval);
  }
}

function RED(msg: string | number) {
  return clc.red(msg);
}

function YELLOW(msg: string | number) {
  return clc.yellow(msg);
}

function GREEN(msg: string | number) {
  return clc.green(msg);
}
