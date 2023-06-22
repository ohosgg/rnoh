import { RNAbility } from '@ohos/rnoh/ts';
import { createRNPackages } from "../RNPackagesFactory"

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return "pages/Index"
  }

  getBundleURL() {
    return "http://localhost:8081/index.bundle?platform=harmony&dev=false&minify=false"
  }

  getInitialProps() {
    return {"foo": "bar"}
  }

  createPackages(ctx) {
    return createRNPackages(ctx)
  }
};
