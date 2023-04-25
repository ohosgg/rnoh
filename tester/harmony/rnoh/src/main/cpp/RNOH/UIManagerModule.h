#pragma once
#include "RNOH/TurboModule.h"

namespace rnoh {
class ComponentJSIBinder {
  public:
    virtual facebook::jsi::Object createBindings(facebook::jsi::Runtime &) = 0;
};

using ComponentJSIBinderByString = std::unordered_map<std::string, std::shared_ptr<ComponentJSIBinder>>;

class UIManagerModule : public TurboModule {
  public:
    UIManagerModule(TurboModule::Context context, std::string name, const ComponentJSIBinderByString &&componentJSIBinderByName);

    std::vector<facebook::jsi::PropNameID> getPropertyNames(facebook::jsi::Runtime &rt) override;

  private:
    ComponentJSIBinderByString m_componentJSIBinderByName;

    static facebook::jsi::Value getConstants(
        facebook::jsi::Runtime &rt, facebook::react::TurboModule &turboModule, const facebook::jsi::Value *args, size_t count);

    static facebook::jsi::Value getConstantsForViewManager(
        facebook::jsi::Runtime &rt, facebook::react::TurboModule &turboModule, const facebook::jsi::Value *args, size_t count);
};

} // namespace rnoh