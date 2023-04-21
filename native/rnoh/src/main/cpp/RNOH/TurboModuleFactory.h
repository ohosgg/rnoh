#pragma once

#include "napi/native_api.h"
#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"
#include "RNOH/UIManagerModule.h"
namespace rnoh {

class TurboModuleFactoryDelegate {
  public:
    using Context = ArkTSTurboModule::Context;
    using SharedTurboModule = std::shared_ptr<facebook::react::TurboModule>;

    virtual ~TurboModuleFactoryDelegate() {};
    virtual SharedTurboModule createTurboModule(Context ctx, const std::string &name) const = 0;
};

class TurboModuleFactory {
  public:
    using Context = ArkTSTurboModule::Context;
    using SharedTurboModule = std::shared_ptr<facebook::react::TurboModule>;

    TurboModuleFactory(napi_env env,
                       napi_ref arkTsTurboModuleProviderRef,
                       const ComponentJSIBinderByString &&,
                       std::shared_ptr<TaskExecutor>,
                       std::vector<std::shared_ptr<TurboModuleFactoryDelegate>>);

    virtual SharedTurboModule create(std::shared_ptr<facebook::react::CallInvoker> jsInvoker,
                                     const std::string &name) const;

  protected:
    SharedTurboModule delegateCreatingTurboModule(Context ctx, const std::string &name) const;

    napi_ref maybeGetArkTsTurboModuleInstanceRef(const std::string &name) const;

    virtual SharedTurboModule handleUnregisteredModuleRequest(Context ctx, const std::string &name) const;

    const ComponentJSIBinderByString m_componentBinderByString;
    napi_env m_env;
    napi_ref m_arkTsTurboModuleProviderRef;
    std::shared_ptr<TaskExecutor> m_taskExecutor;
    std::vector<std::shared_ptr<TurboModuleFactoryDelegate>> m_delegates;
};

} // namespace rnoh
