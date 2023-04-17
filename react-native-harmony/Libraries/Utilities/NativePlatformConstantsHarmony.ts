import { TurboModule, TurboModuleRegistry } from 'react-native';
import { PlatformHarmonyConstants } from "./Platform";

interface Spec extends TurboModule {
  getConstants: () => PlatformHarmonyConstants;
}

export const NativePlatformConstantsHarmony = TurboModuleRegistry.getEnforcing<Spec>('PlatformConstants');
