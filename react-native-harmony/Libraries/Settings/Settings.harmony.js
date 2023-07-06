const Settings = {
  get(key: string): mixed {
    console.warn('Settings is not supported');
    return null;
  },

  set(settings: Object) {
    console.warn('Settings is not supported');
  },

  watchKeys(keys: string | Array<string>, callback: Function): number {
    console.warn('Settings is not supported');
    return -1;
  },

  clearWatch(watchId: number) {
    console.warn('Settings is not supported');
  },
};

module.exports = Settings;
