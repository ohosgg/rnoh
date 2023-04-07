#include "RNOHTurboModuleFactory.h"
#include "TurboModules/RNOHStubModule.h"
#include "TurboModules/RNOHUIManagerModule.h"
#include "ComponentManagers/RNOHViewManager.h"
#include "ComponentManagers/RNOHImageViewManager.h"
#include "RNOHSampleTurboModuleSpec.h"

using namespace rnoh;
using namespace facebook::react;
using namespace facebook::jsi;

napi_env RNOHTurboModuleFactory::arkTsTurboModuleFactoryEnv;

RNOHTurboModuleFactory::RNOHTurboModuleFactory(napi_env env, napi_ref arkTsTurboModuleProviderRef, const ComponentManagerBindingByString &&componentManagerBindingByString, std::shared_ptr<TaskExecutor> taskExecutor)
    : m_env(env),
      m_arkTsTurboModuleProviderRef(arkTsTurboModuleProviderRef),
      m_componentManagerBindingByString(std::move(componentManagerBindingByString)),
      m_taskExecutor(taskExecutor) {}

RNOHTurboModuleFactory::SharedTurboModule RNOHTurboModuleFactory::create(std::shared_ptr<facebook::react::CallInvoker> jsInvoker, const std::string &name) const {
    LOG(INFO) << "Providing Turbo Module: " << name;
    Context ctx{
        {.jsInvoker = jsInvoker},
        .env = m_env,
        .arkTsTurboModuleInstanceRef = this->maybeGetArkTsTurboModuleInstanceRef(name),
        .taskExecutor = m_taskExecutor};
    if (name == "UIManager") {
        return std::make_shared<RNOHUIManagerModule>(ctx, name, std::move(m_componentManagerBindingByString));
    } else if (name == "SampleTurboModule") {
        return std::make_shared<NativeSampleTurboModuleSpecJSI>(ctx, name);
    }

    return this->handleUnregisteredModuleRequest(ctx, name);
}

napi_ref rnoh::RNOHTurboModuleFactory::maybeGetArkTsTurboModuleInstanceRef(const std::string &name) const {
    ArkJS arkJs(m_env);
    auto n_arkTsTurboModuleProvider = arkJs.getReferenceValue(m_arkTsTurboModuleProviderRef);
    {
        auto n_hasModule = arkJs.getObjectProperty(n_arkTsTurboModuleProvider, "hasModule");
        std::array<napi_value, 1> args = {arkJs.createString(name)};
        auto result = arkJs.call(n_hasModule, args, n_arkTsTurboModuleProvider);
        if (!arkJs.getBoolean(result)) {
            return nullptr;
        }
    }
    auto n_getModule = arkJs.getObjectProperty(n_arkTsTurboModuleProvider, "getModule");
    std::array<napi_value, 1> args = {arkJs.createString(name)};
    auto n_turboModuleInstance = arkJs.call(n_getModule, args, n_arkTsTurboModuleProvider);
    return arkJs.createReference(n_turboModuleInstance);
}

RNOHTurboModuleFactory::SharedTurboModule rnoh::RNOHTurboModuleFactory::handleUnregisteredModuleRequest(Context ctx, const std::string &name) const {
    LOG(WARNING) << "Turbo Module '" << name << "' not found - providing stub.";
    return std::make_shared<RNOHStubModule>(name, ctx.jsInvoker);
}
