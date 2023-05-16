#include "SamplePackage.h"
#include "SampleViewComponentDescriptor.h"
#include "SampleTurboModuleSpec.h"

using namespace rnoh;
using namespace facebook;

class SampleTurboModuleFactoryDelegate : public TurboModuleFactoryDelegate {
  public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
        if (name == "SampleTurboModule") {
            return std::make_shared<NativeSampleTurboModuleSpecJSI>(ctx, name);
        }
        return nullptr;
    };
};

std::unique_ptr<TurboModuleFactoryDelegate> SamplePackage::createTurboModuleFactoryDelegate() {
    return std::make_unique<SampleTurboModuleFactoryDelegate>();
}

std::vector<react::ComponentDescriptorProvider> SamplePackage::createComponentDescriptorProviders() {
    return {
        react::concreteComponentDescriptorProvider<react::SampleViewComponentDescriptor>()};
}
