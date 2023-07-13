import { Command } from '@react-native-community/cli-types';
import { globSync } from 'glob';
import pathUtils from 'path';
import tar from 'tar';
import fs from 'fs';
import { ValidationError } from '../core';
import ignore, { Ignore } from 'ignore';
import JSON5 from 'json5';

export const commandPackHarmony: Command = {
  name: 'pack-harmony',
  description: 'Pack native code. Used for package development.',
  options: [
    {
      name: '--oh-module-path <string>',
      description: 'Path to the OH module',
    },
    {
      name: '--harmony-dir-path <string>',
      description: 'Path to the harmony dir',
    },
    {
      name: '--package-json-path <string>',
      description: 'Path to the package.json',
    },
  ],
  func: async (argv, config, args: any) => {
    try {
      await pack(
        pathUtils.resolve(args.harmonyDirPath),
        pathUtils.resolve(args.ohModulePath),
        pathUtils.resolve(args.packageJsonPath)
      );
    } catch (err) {
      if (err instanceof ValidationError) {
        console.error('[ERROR]', err.message);
        process.exit(1);
      } else {
        throw err;
      }
    }
  },
};

async function pack(
  harmonyDirPath: string,
  ohModuleDirPath: string,
  packageJSONPath: string
) {
  syncVersions(
    packageJSONPath,
    pathUtils.join(ohModuleDirPath, 'oh-package.json5')
  );
  await createTGZFromDir(
    ohModuleDirPath,
    pathUtils.join(
      harmonyDirPath,
      `${pathUtils.parse(ohModuleDirPath).name}.tar.gz`
    )
  );
  await createTGZFromDir(
    harmonyDirPath,
    pathUtils.join(pathUtils.dirname(harmonyDirPath), 'harmony.tar.gz')
  );
}

function syncVersions(
  packageJSONFilePath: string,
  ohPackageJSONFilePath: string
) {
  const packageJSONFileContent = JSON.parse(
    fs.readFileSync(packageJSONFilePath, { encoding: 'utf-8' })
  );
  if (fs.existsSync(ohPackageJSONFilePath)) {
    const ohPackageJSONFileContent = JSON5.parse(
      fs.readFileSync(ohPackageJSONFilePath, { encoding: 'utf-8' })
    );
    ohPackageJSONFileContent['version'] = packageJSONFileContent['version'];
    fs.writeFileSync(
      ohPackageJSONFilePath,
      JSON5.stringify(ohPackageJSONFileContent)
    );
  }
}

async function createTGZFromDir(dirPath: string, outputFilePath: string) {
  const ig = getIgnoreUtil(pathUtils.join(dirPath, '.tarignore'));
  const filesToInclude = globSync('**', {
    cwd: dirPath,
    nodir: true,
  }).filter((path) => !ig.ignores(path));
  await createArchive(outputFilePath, dirPath, filesToInclude);
}

function getIgnoreUtil(tarignorePath: string): Ignore {
  if (!fs.existsSync(tarignorePath)) {
    return ignore();
  }
  return ignore().add(fs.readFileSync(tarignorePath).toString());
}

async function createArchive(
  outputFilePath: string,
  packageDirPath: string,
  filesToInclude: string[]
) {
  if (filesToInclude.length === 0) {
    throw new ValidationError('Nothing to pack');
  }
  await tar.c(
    {
      gzip: true,
      file: outputFilePath,
      cwd: packageDirPath,
    },
    filesToInclude
  );
}
