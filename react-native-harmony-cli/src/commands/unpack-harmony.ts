import { Command } from '@react-native-community/cli-types';

import pathUtils from 'path';
import fs from 'fs';
import zlib from 'zlib';
import tar from 'tar';

import { ValidationError } from '../core';

export const commandUnpackHarmony: Command = {
  name: 'unpack-harmony',
  description: 'Pack native code. Used for package development.',
  options: [
    {
      name: '--node-modules-path <string>',
      description: 'Path to node_modules directory',
      default: './node_modules',
    },
    {
      name: '--output-dir <string>',
      description: 'Output directory to which OH modules should be unpacked to',
      default: './harmony/react_native_modules',
    },
  ],
  func: async (argv, config, args: any) => {
    try {
      await unpack(
        pathUtils.resolve(args.nodeModulesPath),
        pathUtils.resolve(args.outputDir)
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

async function unpack(nodeModulesPath: string, outputDirPath: string) {
  const nodeModuleNames = fs.readdirSync(nodeModulesPath);
  for (const nodeModuleName of nodeModuleNames) {
    const nodeModulePath = pathUtils.join(nodeModulesPath, nodeModuleName);
    const harmonyArchivePath = pathUtils.join(nodeModulePath, 'harmony.tar.gz');
    const pkgHarmonyDirPath = pathUtils.join(nodeModulePath, 'harmony');
    if (
      fs.existsSync(harmonyArchivePath) &&
      !fs.existsSync(pkgHarmonyDirPath)
    ) {
      console.log(`[UNPACKED] ${nodeModuleName}/harmony.tar.gz`);
      await unpackTarGz(harmonyArchivePath, pkgHarmonyDirPath);
      const names = fs.readdirSync(pkgHarmonyDirPath);
      for (const name of names) {
        if (name.endsWith('.tar.gz')) {
          const archivePath = pathUtils.join(pkgHarmonyDirPath, name);
          const moduleName = pathUtils.parse(archivePath).name.split('.')[0];
          const modulePath = pathUtils.join(outputDirPath, moduleName);
          if (!fs.existsSync(modulePath)) {
            console.log(`[UNPACKED] ${nodeModuleName}/harmony/${name}`);
            await unpackTarGz(archivePath, modulePath);
          }
        }
      }
    }
  }
}

function unpackTarGz(archivePath: string, outputDirPath: string) {
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }
  const readStream = fs.createReadStream(archivePath);
  const writeStream = tar.extract({
    cwd: outputDirPath,
  });
  readStream.pipe(zlib.createGunzip()).pipe(writeStream);
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      resolve(undefined);
    });
    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}
