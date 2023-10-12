import { join } from 'path';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { CIError, CIFail } from './error';

type CodelinterResult = {
  defectsCount: number;
  errorsCount: number;
  warningsCount: number;
  migrationWarningsCount: number;
};

export async function lintEts({
  tmpDirPath,
  testerDirPath,
  lintingEtsResultPath,
  cwd,
}: {
  tmpDirPath: string;
  testerDirPath: string;
  lintingEtsResultPath: string;
  cwd: string;
}) {
  if (!existsSync(tmpDirPath)) mkdirSync(tmpDirPath);
  try {
    process.chdir(join(testerDirPath, 'harmony'));
    const CODELINTER_OUTPUT_PATH = join(tmpDirPath, 'codelinter_output.txt');
    if (await Bun.file(CODELINTER_OUTPUT_PATH).exists()) {
      rmSync(CODELINTER_OUTPUT_PATH);
    }
    // You may need to unzip cli tools: devecostudio-mac-x86-4.0.3.300/commandline/oh-command-line-tools/bin/codelinter
    execSync(`codelinter -c codelinter.json -o ${CODELINTER_OUTPUT_PATH}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const codelinterOutputFile = Bun.file(CODELINTER_OUTPUT_PATH);
    if (!(await codelinterOutputFile.exists())) {
      throw new CIError(`Couldn't open ${CODELINTER_OUTPUT_PATH}`);
    }
    const result = summarizeCodelinterOutput(await codelinterOutputFile.text());
    if (result.errorsCount > 0) {
      throw new CIFail(`Found ${result.errorsCount} error(s)`);
    }
    const lintingEtsResultResultFile = Bun.file(lintingEtsResultPath);
    if (await lintingEtsResultResultFile.exists()) {
      const previousLintingEtsResult =
        await lintingEtsResultResultFile.json<CodelinterResult>();
      if (result.defectsCount > previousLintingEtsResult.defectsCount) {
        throw new CIFail(
          `Number of defects has increased from ${previousLintingEtsResult.defectsCount} to ${result.defectsCount}`
        );
      }
    }
    await Bun.write(lintingEtsResultPath, JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    throw err;
  } finally {
    process.chdir(cwd);
  }
}

function summarizeCodelinterOutput(fileContent: string): CodelinterResult {
  const errorsCount = (fileContent.match(/severity:error/g) || []).length;
  const warningsCount = (fileContent.match(/severity:warn/g) || []).length;
  const migrationWarningsCount = (
    fileContent.match(/category:ArkTS Migration Errors/g) || []
  ).length;
  const defectsCount = errorsCount + warningsCount;

  return {
    defectsCount,
    warningsCount,
    errorsCount,
    migrationWarningsCount,
  };
}
