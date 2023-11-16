#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {
class PullToRefreshViewJSIBinder : public ViewComponentJSIBinder {
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto nativeProps = ViewComponentJSIBinder::createNativeProps(rt);
        nativeProps.setProperty(rt, "refreshing", "boolean");
        nativeProps.setProperty(rt, "progressViewOffset", "number");
        nativeProps.setProperty(rt, "tintColor", "ColorValue");
        return nativeProps;
    }
    facebook::jsi::Object createDirectEventTypes(facebook::jsi::Runtime &rt) override {
        facebook::jsi::Object events(rt);

        events.setProperty(rt, "topRefresh", createDirectEvent(rt, "onRefresh"));

        return events;
    }
};
} // namespace rnoh