import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface SampleTurboModuleProtocol {
  voidFunc(): void;

  getBool(arg: boolean): boolean;

  getNull(arg: null): null;

  getString(arg: string): string;

  getObject(arg: { x: { y: number; }; }): Object;

  getArray(args: any[]): any[];

  registerFunction(onComplete: () => void): void;
}

export interface Spec extends TurboModule, SampleTurboModuleProtocol { }

export default TurboModuleRegistry.get<Spec>('SampleTurboModule') as Spec | null;