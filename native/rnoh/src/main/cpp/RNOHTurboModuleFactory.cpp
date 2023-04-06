#include "RNOHTurboModuleFactory.h"
#include "TurboModules/RNOHStubModule.h"
#include "TurboModules/RNOHUIManagerModule.h"
#include "ComponentManagers/RNOHViewManager.h"
#include "ComponentManagers/RNOHImageViewManager.h"

using namespace rnoh;
using namespace facebook::react;
using namespace facebook::jsi;

rnoh::RNOHTurboModuleFactory::RNOHTurboModuleFactory(const ComponentManagerBindingByString &&componentManagerBindingByString)
    : m_componentManagerBindingByString(std::move(componentManagerBindingByString)) {}

RNOHTurboModuleFactory::SharedTurboModule RNOHTurboModuleFactory::create(Context ctx, const std::string &name) const {
    LOG(INFO) << "Providing Turbo Module: " << name;
    if (name == "UIManager") {
        return std::make_shared<RNOHUIManagerModule>(name, ctx.jsInvoker, std::move(m_componentManagerBindingByString));
    }
    return this->handleUnregisteredModuleRequest(ctx, name);
}

RNOHTurboModuleFactory::SharedTurboModule rnoh::RNOHTurboModuleFactory::handleUnregisteredModuleRequest(Context ctx, const std::string &name) const {
    LOG(WARNING) << "Turbo Module '" << name << "' not found - providing stub.";
    return std::make_shared<RNOHStubModule>(name, ctx.jsInvoker);
}
