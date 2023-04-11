#pragma once
#include "RNOH/TurboModule.h"

namespace rnoh {
class ComponentManagerBinding {
  public:
    virtual facebook::jsi::Object createManager(facebook::jsi::Runtime &) = 0;
};

using ComponentManagerBindingByString = std::unordered_map<std::string, std::shared_ptr<ComponentManagerBinding>>;

class UIManagerModule : public TurboModule {
  public:
    UIManagerModule(TurboModule::Context context, std::string name, const ComponentManagerBindingByString &&viewManagerBinderByName);

    std::vector<facebook::jsi::PropNameID> getPropertyNames(facebook::jsi::Runtime &rt) override;

  private:
    ComponentManagerBindingByString m_componentManagerBindingByName;

    static facebook::jsi::Value getConstants(
        facebook::jsi::Runtime &rt, facebook::react::TurboModule &turboModule, const facebook::jsi::Value *args, size_t count);

    static facebook::jsi::Value getConstantsForViewManager(
        facebook::jsi::Runtime &rt, facebook::react::TurboModule &turboModule, const facebook::jsi::Value *args, size_t count);
};

} // namespace rnoh