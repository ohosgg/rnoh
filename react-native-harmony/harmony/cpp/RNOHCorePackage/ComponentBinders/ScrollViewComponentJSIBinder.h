#pragma once

#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {
class ScrollViewComponentJSIBinder : public ViewComponentJSIBinder {
  protected:
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto object = ViewComponentJSIBinder::createNativeProps(rt);
        object.setProperty(rt, "scrollEnabled", "boolean");
        object.setProperty(rt, "showsHorizontalScrollIndicator", "boolean");
        object.setProperty(rt, "showsVerticalScrollIndicator", "boolean");
        object.setProperty(rt, "persistentScrollbar", "boolean");
        object.setProperty(rt, "contentOffset", "Object");
        object.setProperty(rt, "indicatorStyle", "number");
        object.setProperty(rt, "bounces", "boolean");
        object.setProperty(rt, "decelerationRate", "number");
        object.setProperty(rt, "scrollEventThrottle", "number");
        object.setProperty(rt, "snapToInterval", "number");
        object.setProperty(rt, "snapToOffsets", "number[]");
        object.setProperty(rt, "snapToStart", "boolean");
        object.setProperty(rt, "snapToEnd", "boolean");
        
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
        events.setProperty(rt, "topMomentumScrollBegin", createDirectEvent(rt, "onMomentumScrollBegin"));
        events.setProperty(rt, "topMomentumScrollEnd", createDirectEvent(rt, "onMomentumScrollEnd"));

        return events;
    }
};
} // namespace rnoh