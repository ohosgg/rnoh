#include "RNOH/PackageProvider.h"

using namespace rnoh;

class SampleTurboModuleFactoryDelegate : public TurboModuleFactoryDelegate {
  public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
        return nullptr;
    };
};

class SamplePackage : public Package {
  public:
    SamplePackage(Package::Context ctx) : Package(ctx) {}

    std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactory() override {
        return std::make_unique<SampleTurboModuleFactoryDelegate>();
    }
};

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {std::make_shared<SamplePackage>(ctx)};
}