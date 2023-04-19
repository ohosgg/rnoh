#include "RNOHCorePackage/UIManagerModule.h"
#include "RNOHCorePackage/ComponentManagerBindings/BaseManager.h"

using namespace rnoh;
using namespace facebook;

UIManagerModule::UIManagerModule(TurboModule::Context context, std::string name, const ComponentManagerBindingByString &&componentManagerBindingByName)
    : TurboModule(context, name),
      m_componentManagerBindingByName(componentManagerBindingByName) {
    MethodMetadata getConstantsMetadata = {.argCount = 0, .invoker = getConstants};

    MethodMetadata getConstantsForViewManagerMetadata = {.argCount = 1, .invoker = getConstantsForViewManager};

    this->methodMap_ = {
        {"getConstants", getConstantsMetadata},
        {"getConstantsForViewManager", getConstantsForViewManagerMetadata},
    };
}

std::vector<facebook::jsi::PropNameID> UIManagerModule::getPropertyNames(facebook::jsi::Runtime &rt) {
    return std::vector<facebook::jsi::PropNameID>();
}

jsi::Value UIManagerModule::getConstants(jsi::Runtime &runtime, react::TurboModule &turboModule, const jsi::Value *args, size_t count) {
    return jsi::Value(runtime, jsi::Object(runtime));
}

facebook::jsi::Value UIManagerModule::getConstantsForViewManager(facebook::jsi::Runtime &rt, react::TurboModule &turboModule, const facebook::jsi::Value *args, size_t count) {
    auto &self = static_cast<UIManagerModule &>(turboModule);
    std::string name = args[0].asString(rt).utf8(rt);
    LOG(INFO) << "getConstantsForViewManager: " << name;
    auto viewManagerBinder = self.m_componentManagerBindingByName[name];
    if (viewManagerBinder) {
        return viewManagerBinder->createManager(rt);
    }
    LOG(ERROR) << "Couldn't find ViewManagerBinder for: " << name;
    return BaseManager().createManager(rt);
}
