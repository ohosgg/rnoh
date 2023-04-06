#pragma once
#include <ReactCommon/TurboModule.h>
#include "TurboModules/RNOHUIManagerModule.h"
namespace rnoh {
class RNOHTurboModuleFactory {
  public:
    using SharedTurboModule = std::shared_ptr<facebook::react::TurboModule>;

    RNOHTurboModuleFactory(const ComponentManagerBindingByString &&);

    struct Context {
        std::shared_ptr<facebook::react::CallInvoker> jsInvoker;
    };

    virtual SharedTurboModule create(Context ctx, const std::string &name) const;

  protected:
    virtual SharedTurboModule handleUnregisteredModuleRequest(Context ctx, const std::string &name) const;

    const ComponentManagerBindingByString m_componentManagerBindingByString;
};
} // namespace rnoh
