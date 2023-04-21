#pragma once
#include "RNOH/UIManagerModule.h"
#include "RNOHCorePackage/ComponentManagerBindings/BaseManager.h"

namespace rnoh {
class ViewManager : public BaseManager {
  protected:
    virtual facebook::jsi::Object createBubblingEventTypes(facebook::jsi::Runtime &rt) {
        facebook::jsi::Object events(rt);

        events.setProperty(rt, "topTouchStart", createBubblingCapturedEvent(rt, "onTouchStart"));
        events.setProperty(rt, "topTouchMove", createBubblingCapturedEvent(rt, "onTouchMove"));
        events.setProperty(rt, "topTouchEnd", createBubblingCapturedEvent(rt, "onTouchEnd"));
        events.setProperty(rt, "topTouchCancel", createBubblingCapturedEvent(rt, "onTouchCancel"));

        return events;
    }
};

} // namespace rnoh