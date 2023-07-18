import { Command } from '@react-native-community/cli-types';

import pathUtils from 'path';
import fs from 'fs';
import zlib from 'zlib';
import tar from 'tar';
import JSON5 from 'json5';
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
    const nodePackageVersion = getNodePackageVersion(nodeModulePath);
    const harmonyArchivePath = pathUtils.join(nodeModulePath, 'harmony.tar.gz');
    const pkgHarmonyDirPath = pathUtils.join(nodeModulePath, 'harmony');
    const ohModulesInfo = getOhModulesInfo(pkgHarmonyDirPath, outputDirPath);
    if (
      nodePackageVersion &&
      shouldUnpackHarmonyArchive(
        harmonyArchivePath,
        pkgHarmonyDirPath,
        outputDirPath,
        nodePackageVersion
      )
    ) {
      console.log(`[UNPACKING] ${nodeModuleName}/harmony.tar.gz`);
      await unpackTarGz(harmonyArchivePath, pkgHarmonyDirPath);
      for (const ohModuleInfo of ohModulesInfo) {
        console.log(
          `[UNPACKING] ${nodeModuleName}/harmony/${ohModuleInfo.archiveFileName}`
        );
        await unpackTarGz(
          ohModuleInfo.archivePath,
          ohModuleInfo.computedModulePath
        );
      }
    }
  }
}

function shouldUnpackHarmonyArchive(
  harmonyArchivePath: string,
  pkgHarmonyDirPath: string,
  outputDirPath: string,
  nodePackageVersion: string
) {
  if (!fs.existsSync(harmonyArchivePath)) return false;
  if (!fs.existsSync(pkgHarmonyDirPath)) return true;
  const ohModulesInfo = getOhModulesInfo(pkgHarmonyDirPath, outputDirPath);
  for (const ohModuleInfo of ohModulesInfo) {
    if (
      !fs.existsSync(ohModuleInfo.computedModulePath) ||
      getOhPackageVersion(ohModuleInfo.computedModulePath) !==
        nodePackageVersion
    ) {
      return true;
    }
  }
  return false;
}

function getNodePackageVersion(nodeModulePath: string) {
  const packageJSONPath = pathUtils.join(nodeModulePath, 'package.json');
  if (!fs.existsSync(packageJSONPath)) return null;
  const content = fs.readFileSync(packageJSONPath, { encoding: 'utf-8' });
  return JSON.parse(content)['version'];
}

function getOhPackageVersion(modulePath: string) {
  const ohPackagePath = pathUtils.join(modulePath, 'oh-package.json5');
  if (!fs.existsSync(ohPackagePath)) return null;
  const content = fs.readFileSync(ohPackagePath, { encoding: 'utf-8' });
  return JSON5.parse(content)['version'];
}

function getOhModulesInfo(pkgHarmonyDirPath: string, outputDirPath: string) {
  const results: {
    archivePath: string;
    archiveFileName: string;
    computedModulePath: string;
    computedModuleName: string;
  }[] = [];
  if (!fs.existsSync(pkgHarmonyDirPath)) return [];
  const names = fs.readdirSync(pkgHarmonyDirPath);
  for (const name of names) {
    if (name.endsWith('.tar.gz')) {
      const archivePath = pathUtils.join(pkgHarmonyDirPath, name);
      const computedModuleName = pathUtils
        .parse(archivePath)
        .name.split('.')[0];
      const computedModulePath = pathUtils.join(
        outputDirPath,
        computedModuleName
      );
      results.push({
        archivePath,
        archiveFileName: name,
        computedModulePath,
        computedModuleName,
      });
    }
  }
  return results;
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
