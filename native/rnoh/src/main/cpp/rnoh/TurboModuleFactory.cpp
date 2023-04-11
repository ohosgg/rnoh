#include "rnoh/TurboModuleFactory.h"

#include "rnoh/CorePackage/StubModule.h"
#include "rnoh/CorePackage/UIManagerModule.h"
#include "rnoh/CorePackage/SampleTurboModuleSpec.h"
#include "rnoh/CorePackage/ViewManager.h"
#include "rnoh/CorePackage/ImageViewManager.h"


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
    {
        auto result = arkJs.getObject(m_arkTsTurboModuleProviderRef).call("hasModule", {arkJs.createString(name)});
        if (!arkJs.getBoolean(result)) {
            return nullptr;
        }
    }
    auto n_turboModuleInstance = arkJs.getObject(m_arkTsTurboModuleProviderRef).call("getModule", {arkJs.createString(name)});
    return arkJs.createReference(n_turboModuleInstance);
}

RNOHTurboModuleFactory::SharedTurboModule rnoh::RNOHTurboModuleFactory::handleUnregisteredModuleRequest(Context ctx, const std::string &name) const {
    LOG(WARNING) << "Turbo Module '" << name << "' not found - providing stub.";
    return std::make_shared<RNOHStubModule>(name, ctx.jsInvoker);
}
