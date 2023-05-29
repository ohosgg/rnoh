import { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { Linking as LinkingInterface } from 'react-native';

class Linking extends NativeEventEmitter implements LinkingInterface {
  addEventListener(
    type: 'url',
    handler: (event: { url: string }) => void
  ): EmitterSubscription {
    return this.addListener(type, handler);
  }

  openURL(url: string): Promise<void> {
    this.warnModuleNotImplemented('openURL');
    return Promise.resolve();
  }

  canOpenURL(url: string): Promise<boolean> {
    this.warnModuleNotImplemented('canOpenURL');
    return Promise.resolve(false);
  }

  getInitialURL(): Promise<string | null> {
    this.warnModuleNotImplemented('getInitialURL');
    return Promise.resolve(null);
  }

  openSettings(): Promise<void> {
    this.warnModuleNotImplemented('openSettings');
    return Promise.resolve();
  }

  sendIntent(
    action: string,
    extras?: { key: string; value: string | number | boolean }[] | undefined
  ): Promise<void> {
    this.warnModuleNotImplemented('sendIntent');
    return Promise.resolve();
  }

  private warnModuleNotImplemented(methodName: string) {
    console.warn(`Linking::${methodName} - Linking module is not implemented`);
  }
}

module.exports = new Linking();
