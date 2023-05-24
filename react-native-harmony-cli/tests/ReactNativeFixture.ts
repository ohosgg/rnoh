import { execaCommandSync } from 'execa';
import pathUtils from 'path';
export class ReactNativeFixture {
  constructor(private cwd: string) {}

  packHarmony(args: { harmonyDirPath: string; ohModulePath: string }) {
    return execaCommandSync(
      `react-native pack-harmony --harmony-dir-path ${this.useCwd(
        args.harmonyDirPath
      )} --oh-module-path ${this.useCwd(args.ohModulePath)}`
    ).stdout;
  }
  unpackHarmony(args: { nodeModulesPath: string; outputDir: string }) {
    return execaCommandSync(
      `react-native unpack-harmony --node-modules-path ${this.useCwd(
        args.nodeModulesPath
      )} --output-dir ${this.useCwd(args.outputDir)}`
    ).stdout;
  }

  private useCwd(relPath: string) {
    return pathUtils.join(this.cwd, relPath);
  }
}
