const Settings = {
  get(key: string): mixed {
    return null;
  },

  set(settings: Object) {},

  watchKeys(keys: string | Array<string>, callback: Function): number {
    return -1;
  },

  clearWatch(watchId: number) {},
};

module.exports = Settings;
