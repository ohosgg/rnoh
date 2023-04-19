#include "RNOH/TurboModuleFactory.h"

#include "RNOHCorePackage/StubModule.h"
#include "RNOHCorePackage/UIManagerModule.h"
#include "RNOHCorePackage/SampleTurboModuleSpec.h"
#include "RNOHCorePackage/ViewManager.h"
#include "RNOHCorePackage/ImageViewManager.h"
#include "RNOHCorePackage/generated/PlatformConstantsTurboModule.h"
#include "RNOHCorePackage/generated/DeviceInfoTurboModule.h"

using namespace rnoh;
using namespace facebook;

napi_env TurboModuleFactory::arkTsTurboModuleFactoryEnv;

TurboModuleFactory::TurboModuleFactory(napi_env env, napi_ref arkTsTurboModuleProviderRef, const ComponentManagerBindingByString &&componentManagerBindingByString, std::shared_ptr<TaskExecutor> taskExecutor)
    : m_env(env),
      m_arkTsTurboModuleProviderRef(arkTsTurboModuleProviderRef),
      m_componentManagerBindingByString(std::move(componentManagerBindingByString)),
      m_taskExecutor(taskExecutor) {}

TurboModuleFactory::SharedTurboModule TurboModuleFactory::create(std::shared_ptr<facebook::react::CallInvoker> jsInvoker, const std::string &name) const {
    LOG(INFO) << "Providing Turbo Module: " << name;
    Context ctx{
        {.jsInvoker = jsInvoker},
        .env = m_env,
        .arkTsTurboModuleInstanceRef = this->maybeGetArkTsTurboModuleInstanceRef(name),
        .taskExecutor = m_taskExecutor};
    if (name == "UIManager") {
        return std::make_shared<UIManagerModule>(ctx, name, std::move(m_componentManagerBindingByString));
    } else if (name == "SampleTurboModule") {
        return std::make_shared<NativeSampleTurboModuleSpecJSI>(ctx, name);
    } else if (name == "PlatformConstants") {
        return std::make_shared<PlatformConstantsTurboModule>(ctx, name);
    } else if (name == "DeviceInfo") {
        return std::make_shared<DeviceInfoTurboModule>(ctx, name);
    }

    return this->handleUnregisteredModuleRequest(ctx, name);
}

napi_ref TurboModuleFactory::maybeGetArkTsTurboModuleInstanceRef(const std::string &name) const {
    napi_ref result;
    m_taskExecutor->runSyncTask(TaskThread::MAIN, [env = m_env, arkTsTurboModuleProviderRef = m_arkTsTurboModuleProviderRef, name, &result]() {
        ArkJS arkJs(env);
        {
            auto result = arkJs.getObject(arkTsTurboModuleProviderRef).call("hasModule", {arkJs.createString(name)});
            if (!arkJs.getBoolean(result)) {
                return;
            }
        }
        auto n_turboModuleInstance = arkJs.getObject(arkTsTurboModuleProviderRef).call("getModule", {arkJs.createString(name)});
        result = arkJs.createReference(n_turboModuleInstance);
    });
    return result;
}

TurboModuleFactory::SharedTurboModule TurboModuleFactory::handleUnregisteredModuleRequest(Context ctx, const std::string &name) const {
    LOG(WARNING) << "Turbo Module '" << name << "' not found - providing stub.";
    return std::make_shared<StubModule>(name, ctx.jsInvoker);
}
