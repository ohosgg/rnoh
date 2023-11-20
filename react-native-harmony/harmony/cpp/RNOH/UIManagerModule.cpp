#include "RNOH/UIManagerModule.h"
#include "RNOH/BaseComponentJSIBinder.h"

using namespace rnoh;
using namespace facebook;

UIManagerModule::UIManagerModule(TurboModule::Context context, std::string name, const ComponentJSIBinderByString &&componentJSIBinderByName)
    : TurboModule(context, name),
      m_componentJSIBinderByName(componentJSIBinderByName) {
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
    auto componentJSIBinder = self.m_componentJSIBinderByName[name];
    if (componentJSIBinder) {
        return componentJSIBinder->createBindings(rt);
    }
    LOG(ERROR) << "Couldn't find ComponentJSIBinder for: " << name;
    return jsi::Value::null();
}
