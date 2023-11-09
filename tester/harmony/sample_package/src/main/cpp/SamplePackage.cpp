#include "SamplePackage.h"
#include "SampleViewComponentDescriptor.h"
#include "PropsDisplayerComponentDescriptor.h"
#include "SampleTurboModuleSpec.h"
#include "NativeCxxModuleExampleCxxSpec.h"
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"

using namespace rnoh;
using namespace facebook;

class SampleTurboModuleFactoryDelegate : public TurboModuleFactoryDelegate {
public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
        if (name == "SampleTurboModule") {
            return std::make_shared<NativeSampleTurboModuleSpecJSI>(ctx, name);
        } else if (name == "NativeCxxModuleExampleCxx") {
            return std::make_shared<NativeCxxModuleExampleCxxSpecJSI>(ctx, name);
        }
        return nullptr;
    };
};

std::unique_ptr<TurboModuleFactoryDelegate> SamplePackage::createTurboModuleFactoryDelegate() {
    return std::make_unique<SampleTurboModuleFactoryDelegate>();
}

std::vector<react::ComponentDescriptorProvider> SamplePackage::createComponentDescriptorProviders() {
    return {
        react::concreteComponentDescriptorProvider<react::SampleViewComponentDescriptor>(),
        react::concreteComponentDescriptorProvider<react::PropsDisplayerComponentDescriptor>(),
    };
}

ComponentNapiBinderByString SamplePackage::createComponentNapiBinderByName() {
    return {
        {"PropsDisplayer", std::make_shared<ViewComponentNapiBinder>()},
    };
};