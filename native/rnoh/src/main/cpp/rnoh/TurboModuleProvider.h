#pragma once
#include <functional>
#include <butter/map.h>
#include <ReactCommon/TurboModule.h>
#include <ReactCommon/RuntimeExecutor.h>
#include <ReactCommon/CallInvoker.h>
#include <ReactCommon/LongLivedObject.h>
#include "RNOH/TurboModuleFactory.h"

namespace rnoh {
class RNOHTurboModuleProvider : public std::enable_shared_from_this<RNOHTurboModuleProvider> {
  public:
    RNOHTurboModuleProvider(std::shared_ptr<facebook::react::CallInvoker> jsInvoker,
                            RNOHTurboModuleFactory &&turboModuleFactory);

    std::shared_ptr<facebook::react::TurboModule> getTurboModule(std::string const &moduleName);
    void installJSBindings(facebook::react::RuntimeExecutor runtimeExecutor);

  private:
    std::shared_ptr<facebook::react::CallInvoker> m_jsInvoker;
    std::function<std::shared_ptr<facebook::react::TurboModule>(std::string const &, std::shared_ptr<facebook::react::CallInvoker>)> m_createTurboModule;
    facebook::butter::map<std::string, std::shared_ptr<facebook::react::TurboModule>> m_cache;
};
} // namespace rnoh