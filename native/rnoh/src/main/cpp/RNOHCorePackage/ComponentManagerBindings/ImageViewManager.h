#pragma once
#include "RNOHCorePackage/ComponentManagerBindings/ViewManager.h"

namespace rnoh {
class ImageViewManager : public ViewManager {
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto object = ViewManager::createNativeProps(rt);
        object.setProperty(rt, "source", "array");
        return object;
    }
};
} // namespace rnoh