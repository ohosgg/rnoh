import { Command } from '@react-native-community/cli-types';
import { globSync } from 'glob';
import pathUtils from 'path';
import tar from 'tar';
import fs from 'fs';
import { ValidationError } from '../core';

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
  ],
  func: async (argv, config, args: any) => {
    try {
      await pack(
        pathUtils.resolve(args.harmonyDirPath),
        pathUtils.resolve(args.ohModulePath)
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

async function pack(harmonyDirPath: string, ohModulePath: string) {
  await createTGZFromDir(
    ohModulePath,
    pathUtils.join(
      harmonyDirPath,
      `${pathUtils.parse(ohModulePath).name}.tar.gz`
    )
  );
  await createTGZFromDir(
    harmonyDirPath,
    pathUtils.join(pathUtils.dirname(harmonyDirPath), 'harmony.tar.gz')
  );
}

async function createTGZFromDir(dirPath: string, outputFilePath: string) {
  const ignorePatterns = maybeGetIgnorePatterns(
    pathUtils.join(dirPath, '.tarignore')
  );
  const filesToInclude = globSync('**', {
    ignore: ignorePatterns ?? [],
    cwd: dirPath,
    nodir: true,
  });
  await createArchive(outputFilePath, dirPath, filesToInclude);
}

function maybeGetIgnorePatterns(tarignorePath: string): string[] | null {
  if (!fs.existsSync(tarignorePath)) {
    return null;
  }
  const tarignoreContent = fs.readFileSync(tarignorePath, 'utf-8');
  return tarignoreContent.split('\n').filter(Boolean);
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
