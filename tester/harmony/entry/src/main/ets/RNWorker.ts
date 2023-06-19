import { RNWorker } from "@ohos/rnoh"
import { createRNPackages } from "./RNPackagesFactory"

RNWorker.create(createRNPackages);
