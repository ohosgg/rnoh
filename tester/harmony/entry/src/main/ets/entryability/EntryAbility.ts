import { RNAbility } from '@ohos/rnoh/ts';
import { SamplePackage } from "@ohos/rnoh-sample-package/ts"


export default class EntryAbility extends RNAbility {
  getPagePath() {
    return "pages/Index"
  }

  getBundleURL() {
    return "http://localhost:8081/index.bundle?platform=harmony&dev=false&minify=false"
  }

  createPackages(ctx) {
    return [
      new SamplePackage(ctx)
    ]
  }
};
