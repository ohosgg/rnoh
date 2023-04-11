#pragma once

#include "napi/native_api.h"
#include <ReactCommon/TurboModule.h>

#include "rnoh/CorePackage/UIManagerModule.h"
#include "rnoh/ArkTSTurboModule.h"

namespace rnoh {
class RNOHTurboModuleFactory {
  public:
    static napi_env arkTsTurboModuleFactoryEnv;

    using Context = RNOHArkTSTurboModule::Context;
    using SharedTurboModule = std::shared_ptr<facebook::react::TurboModule>;

    RNOHTurboModuleFactory(napi_env env,
                           napi_ref arkTsTurboModuleProviderRef,
                           const ComponentManagerBindingByString &&,
                           std::shared_ptr<TaskExecutor>);

    virtual SharedTurboModule create(std::shared_ptr<facebook::react::CallInvoker> jsInvoker,
                                     const std::string &name) const;

  protected:
    napi_ref maybeGetArkTsTurboModuleInstanceRef(const std::string &name) const;

    virtual SharedTurboModule handleUnregisteredModuleRequest(Context ctx, const std::string &name) const;

    const ComponentManagerBindingByString m_componentManagerBindingByString;
    napi_env m_env;
    napi_ref m_arkTsTurboModuleProviderRef;
    std::shared_ptr<TaskExecutor> m_taskExecutor;
};
} // namespace rnoh
