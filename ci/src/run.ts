import { join } from 'path';
import { verifyTester } from './verifyTester';
import { Result } from './types';

const CWD = process.cwd();
const SCRIPT_DIR_PATH = import.meta.dir;
const MODULE_ROOT_PATH = join(SCRIPT_DIR_PATH, '..');
const PROJECT_ROOT_PATH = join(MODULE_ROOT_PATH, '..');

await (async function run() {
  const steps: (() => Promise<Result<any>>)[] = [runVerifyTester];
  for (const step of steps) {
    const result = await step();
    if (result.errMsg) {
      console.error(result.errMsg);
      process.exit(1);
    }
  }
})();

async function runVerifyTester() {
  return verifyTester({
    cwd: CWD,
    testerDirPath: join(PROJECT_ROOT_PATH, 'tester'),
  });
}
