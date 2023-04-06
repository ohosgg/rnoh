#include "TurboModules/RNOHUIManagerModule.h"

using namespace rnoh;
using namespace facebook::jsi;

RNOHUIManagerModule::RNOHUIManagerModule(std::string name, std::shared_ptr<facebook::react::CallInvoker> jsInvoker, const ComponentManagerBindingByString &&componentManagerBindingByName)
    : RNOHTurboModule(name, jsInvoker),
      m_componentManagerBindingByName(componentManagerBindingByName) {
    MethodMetadata getConstantsMetadata = {.argCount = 0, .invoker = getConstants};

    MethodMetadata getConstantsForViewManagerMetadata = {.argCount = 1, .invoker = getConstantsForViewManager};

    this->methodMap_ = {
        {"getConstants", getConstantsMetadata},
        {"getConstantsForViewManager", getConstantsForViewManagerMetadata},
    };
}

std::vector<facebook::jsi::PropNameID> rnoh::RNOHUIManagerModule::getPropertyNames(facebook::jsi::Runtime &rt) {
    return std::vector<facebook::jsi::PropNameID>();
}

Value RNOHUIManagerModule::getConstants(Runtime &runtime, TurboModule &turboModule, const Value *args, size_t count) {
    return Value(runtime, Object(runtime));
}

facebook::jsi::Value rnoh::RNOHUIManagerModule::getConstantsForViewManager(facebook::jsi::Runtime &rt, TurboModule &turboModule, const facebook::jsi::Value *args, size_t count) {
    auto &self = static_cast<RNOHUIManagerModule &>(turboModule);
    std::string name = args[0].asString(rt).utf8(rt);
    LOG(INFO) << "getConstantsForViewManager: " << name;
    auto viewManagerBinder = self.m_componentManagerBindingByName[name];
    if (viewManagerBinder) {
        return viewManagerBinder->createManager(rt);
    }
    LOG(ERROR) << "Couldn't find ViewManagerBinder for: " << name;
    return Value::undefined();
}
