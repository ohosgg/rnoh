#pragma once

#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {
class ScrollViewComponentJSIBinder : public ViewComponentJSIBinder {
  protected:
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto object = ViewComponentJSIBinder::createNativeProps(rt);
        object.setProperty(rt, "scrollEnabled", "boolean");
        return object;
    }

    facebook::jsi::Object createBubblingEventTypes(facebook::jsi::Runtime &rt) override {
        return facebook::jsi::Object(rt);
    }

    facebook::jsi::Object createDirectEventTypes(facebook::jsi::Runtime &rt) override {
        facebook::jsi::Object events(rt);

        events.setProperty(rt, "topScroll", createDirectEvent(rt, "onScroll"));
        events.setProperty(rt, "topScrollBeginDrag", createDirectEvent(rt, "onScrollBeginDrag"));
        events.setProperty(rt, "topScrollEndDrag", createDirectEvent(rt, "onScrollEndDrag"));

        return events;
    }
};
} // namespace rnoh