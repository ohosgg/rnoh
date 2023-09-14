import { AnyJSBundleProvider, MetroJSBundleProvider, ResourceJSBundleProvider, RNAbility} from 'rnoh/ts';
import { createRNPackages } from '../RNPackagesFactory';

export default class EntryAbility extends RNAbility {
  onCreate(want, param) {
    super.onCreate(want, param);

    const rnInstance = this.createAndRegisterRNInstance({createRNPackages});
    rnInstance.runJSBundle(new AnyJSBundleProvider([new MetroJSBundleProvider(), new ResourceJSBundleProvider(this.context.resourceManager, 'bundle.harmony.js')]))
    AppStorage.setOrCreate("ReactInstance", rnInstance);
  }

  getPagePath() {
    return 'pages/Index';
  }
}
