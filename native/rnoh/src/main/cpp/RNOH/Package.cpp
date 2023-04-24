#include "RNOH/Package.h"

using namespace rnoh;
using namespace facebook;

Package::Package(Context ctx) : m_ctx(ctx) {
}

std::unique_ptr<TurboModuleFactoryDelegate> Package::createTurboModuleFactoryDelegate() {
    return nullptr;
}

std::vector<react::ComponentDescriptorProvider> Package::createComponentDescriptorProviders() {
    return {};
}

ComponentJSIBinderByString rnoh::Package::createComponentJSIBinderByName() {
    return {};
}

ComponentNapiBinderByString rnoh::Package::createComponentNapiBinderByName() {
    return {};
}
