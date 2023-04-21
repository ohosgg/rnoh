#pragma once
#include "RNOH/Package.h"
#include "RNOHCorePackage/SampleTurboModuleSpec.h"
#include "RNOHCorePackage/generated/PlatformConstantsTurboModule.h"
#include "RNOHCorePackage/generated/DeviceInfoTurboModule.h"
#include "RNOHCorePackage/generated/SourceCodeTurboModule.h"
#include "RNOHCorePackage/generated/TimingTurboModule.h"

namespace rnoh {

class RNOHCoreTurboModuleFactoryDelegate : public TurboModuleFactoryDelegate {
  public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
        if (name == "SampleTurboModule") {
            return std::make_shared<NativeSampleTurboModuleSpecJSI>(ctx, name);
        } else if (name == "PlatformConstants") {
            return std::make_shared<PlatformConstantsTurboModule>(ctx, name);
        } else if (name == "DeviceInfo") {
            return std::make_shared<DeviceInfoTurboModule>(ctx, name);
        } else if (name == "SourceCode") {
            return std::make_shared<SourceCodeTurboModule>(ctx, name);
        } else if (name == "Timing") {
            return std::make_shared<TimingTurboModule>(ctx, name);
        }
        return nullptr;
    };
};

class RNOHCorePackage : public Package {
  public:
    RNOHCorePackage(Package::Context ctx) : Package(ctx){};

    std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override {
        return std::make_unique<RNOHCoreTurboModuleFactoryDelegate>();
    }
};

} // namespace rnoh