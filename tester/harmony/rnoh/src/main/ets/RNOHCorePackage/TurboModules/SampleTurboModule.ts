import { TurboModule } from "../../TurboModule";

export class SampleTurboModule extends TurboModule {
  voidFunc() {
    console.log("RNOH SampleTurboModule::voidFunc");
  }

  getBool(arg: boolean): boolean {
    console.log(`RNOH SampleTurboModule::getBool(${arg})`);
    return arg;
  }

  getNull(arg: null) {
    console.log(`RNOH SampleTurboModule::getNull(${arg})`);
    return arg;
  };

  getString(arg: string): string {
    console.log(`RNOH SampleTurboModule::getString(${arg})`);
    return arg;
  }

  getObject(arg: { x: { y: number; }; }): Object {
    console.log(`RNOH SampleTurboModule::getString(${arg})`);
    return arg;
  }

  getArray(args: any[]): any[] {
    console.log(`RNOH SampleTurboModule::getArray(${args})`);
    return args;
  }

  registerFunction(onComplete: (value: string) => void): void {
    console.log(`RNOH SampleTurboModule::registerFunction + trigger`);
    setTimeout(() => {
      onComplete?.("... from native side");
    }, 1000);
  }

  doAsyncJob(shouldResolve: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldResolve) {
          resolve("resolved on native side");
        } else {
          reject("rejected on native side");
        }
      }, 1000);
    });
  }
}