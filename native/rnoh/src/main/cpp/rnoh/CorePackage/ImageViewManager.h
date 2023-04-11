#pragma once
#include "rnoh/CorePackage/ViewManager.h"

namespace rnoh {
class RNOHImageViewManager : public RNOHViewManager {
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto object = RNOHViewManager::createNativeProps(rt);
        object.setProperty(rt, "source", "array");
        return object;
    }
};
} // namespace rnoh