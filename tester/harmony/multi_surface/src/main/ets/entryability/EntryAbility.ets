import { AnyJSBundleProvider, MetroJSBundleProvider, ResourceJSBundleProvider, RNAbility, SurfaceHandle} from 'rnoh/ts';
import { createRNPackages } from '../RNPackagesFactory';

export default class EntryAbility extends RNAbility {
  onCreate(want, param) {
    super.onCreate(want, param);

    const rnInstance = this.createAndRegisterRNInstance({createRNPackages});
    rnInstance.runJSBundle(new AnyJSBundleProvider([new MetroJSBundleProvider(), new ResourceJSBundleProvider(this.context.resourceManager, 'bundle.harmony.js')]))
    AppStorage.setOrCreate("AppRNInstance", rnInstance);

    const surfaceByAppKey = {};
    AppStorage.setOrCreate("ReactSurfaceByAppKey", surfaceByAppKey);
  }

  getPagePath() {
    return 'pages/Index';
  }
}
