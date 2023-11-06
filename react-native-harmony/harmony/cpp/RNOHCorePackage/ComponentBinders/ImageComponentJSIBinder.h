#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {
class ImageComponentJSIBinder : public ViewComponentJSIBinder {
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto object = ViewComponentJSIBinder::createNativeProps(rt);
        object.setProperty(rt, "source", "array");
        object.setProperty(rt, "resizeMode", "string");
        object.setProperty(rt, "blurRadius", "number");
        return object;
    }
    facebook::jsi::Object createDirectEventTypes(facebook::jsi::Runtime &rt) override {
        facebook::jsi::Object events(rt);

        events.setProperty(rt, "topLoadStart", createDirectEvent(rt, "onLoadStart"));
        events.setProperty(rt, "topLoad", createDirectEvent(rt, "onLoad"));
        events.setProperty(rt, "topError", createDirectEvent(rt, "onError"));

        return events;
    }
};
} // namespace rnoh