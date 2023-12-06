import { execSync } from 'child_process';
import { Result } from './types';

export async function verifyTester({
  cwd,
  testerDirPath,
}: {
  testerDirPath: string;
  cwd: string;
}): Promise<Result<boolean>> {
  try {
    process.chdir(testerDirPath);
    execSync('npm run verify', { stdio: 'inherit' });
  } catch (err) {
    return { errMsg: 'Tester verification failed' };
  } finally {
    process.chdir(cwd);
  }
  return { ok: true };
}
