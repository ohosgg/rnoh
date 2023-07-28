#pragma once

#include "RNOH/UIManagerModule.h"
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {

class ModalHostViewJSIBinder : public ViewComponentJSIBinder {
protected:
    facebook::jsi::Object createBubblingEventTypes(facebook::jsi::Runtime &rt) override {
        auto events = ViewComponentJSIBinder::createBubblingEventTypes(rt);
        events.setProperty(rt, "topRequestClose", createBubblingCapturedEvent(rt, "onRequestClose"));
        events.setProperty(rt, "topShow", createBubblingCapturedEvent(rt, "onShow"));
        return events;
    }

    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto nativeProps = ViewComponentJSIBinder::createNativeProps(rt);
        nativeProps.setProperty(rt, "transparent", "boolean");
        nativeProps.setProperty(rt, "visible", "boolean");
        nativeProps.setProperty(rt, "identifier", "number");
        return nativeProps;
    }
};

} // namespace rnoh