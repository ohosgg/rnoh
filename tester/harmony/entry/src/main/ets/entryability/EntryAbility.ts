import {RNAbility} from 'rnoh/ts';
import {createRNPackages} from '../RNPackagesFactory';

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return 'pages/Index';
  }
}
