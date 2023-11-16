#pragma once
#include "RNOH/UIManagerModule.h"

namespace rnoh {
class BaseComponentJSIBinder : public ComponentJSIBinder {
  public:
    facebook::jsi::Object createBindings(facebook::jsi::Runtime &rt) override {
        facebook::jsi::Object baseManagerConfig(rt);
        baseManagerConfig.setProperty(rt, "NativeProps", this->createNativeProps(rt));
        baseManagerConfig.setProperty(rt, "Constants", this->createConstants(rt));
        baseManagerConfig.setProperty(rt, "Commands", this->createCommands(rt));
        baseManagerConfig.setProperty(rt, "bubblingEventTypes", this->createBubblingEventTypes(rt));
        baseManagerConfig.setProperty(rt, "directEventTypes", this->createDirectEventTypes(rt));
        return baseManagerConfig;
    };

  protected:
    virtual facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) {
        facebook::jsi::Object nativeProps(rt);
        nativeProps.setProperty(rt, "hitSlop", true);
        nativeProps.setProperty(rt, "onLayout", true);
        nativeProps.setProperty(rt, "pointerEvents", "string");
        nativeProps.setProperty(rt, "collapsable", "boolean");
        nativeProps.setProperty(rt, "focusable", "boolean");
        return nativeProps;
    }

    virtual facebook::jsi::Object createConstants(facebook::jsi::Runtime &rt) {
        return facebook::jsi::Object(rt);
    }

    virtual facebook::jsi::Object createCommands(facebook::jsi::Runtime &rt) {
        return facebook::jsi::Object(rt);
    }

    virtual facebook::jsi::Object createBubblingEventTypes(facebook::jsi::Runtime &rt) {
        return facebook::jsi::Object(rt);
    }

    virtual facebook::jsi::Object createDirectEventTypes(facebook::jsi::Runtime &rt) {
        return facebook::jsi::Object(rt);
    }

    static facebook::jsi::Object createBubblingCapturedEvent(facebook::jsi::Runtime &runtime, std::string name) {
        facebook::jsi::Object event(runtime);
        facebook::jsi::Object phasedRegistrationNames(runtime);
        phasedRegistrationNames.setProperty(runtime, "bubbled", name);
        phasedRegistrationNames.setProperty(runtime, "captured", name + "Capture");
        event.setProperty(runtime, "phasedRegistrationNames", phasedRegistrationNames);
        return event;
    }

    static facebook::jsi::Object createDirectEvent(facebook::jsi::Runtime &runtime, std::string name) {
        facebook::jsi::Object event(runtime);
        event.setProperty(runtime, "registrationName", name);
        return event;
    }
};
} // namespace rnoh