import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  voidFunc(): void;
}

export default TurboModuleRegistry.get<Spec>(
  'SampleTurboModule',
) as Spec | null;
