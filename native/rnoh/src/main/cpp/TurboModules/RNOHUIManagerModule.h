#pragma once
#include "TurboModules/RNOHTurboModule.h"

namespace rnoh {
class RNOHComponentManagerBinding {
  public:
    virtual facebook::jsi::Object createManager(facebook::jsi::Runtime &) = 0;
};

using ComponentManagerBindingByString = std::unordered_map<std::string, std::shared_ptr<RNOHComponentManagerBinding>>;

class RNOHUIManagerModule : public RNOHTurboModule {
  public:
    RNOHUIManagerModule(std::string name, std::shared_ptr<facebook::react::CallInvoker> jsInvoker, const ComponentManagerBindingByString &&viewManagerBinderByName);

    std::vector<facebook::jsi::PropNameID> getPropertyNames(facebook::jsi::Runtime &rt) override;

  private:
    ComponentManagerBindingByString m_componentManagerBindingByName;

    static facebook::jsi::Value getConstants(
        facebook::jsi::Runtime &rt, facebook::react::TurboModule &turboModule, const facebook::jsi::Value *args, size_t count);

    static facebook::jsi::Value getConstantsForViewManager(
        facebook::jsi::Runtime &rt, facebook::react::TurboModule &turboModule, const facebook::jsi::Value *args, size_t count);
};

} // namespace rnoh