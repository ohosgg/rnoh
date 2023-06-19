import { RNPackageContext, RNPackage } from "@ohos/rnoh/ts"
import { SamplePackage } from "@ohos/rnoh-sample-package/ts"

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [new SamplePackage(ctx)];
}