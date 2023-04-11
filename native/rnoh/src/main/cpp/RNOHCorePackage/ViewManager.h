#pragma once
#include "RNOHCorePackage/UIManagerModule.h"

namespace rnoh {
class ViewManager : public ComponentManagerBinding {
  public:
    facebook::jsi::Object createManager(facebook::jsi::Runtime &rt) override {
        facebook::jsi::Object baseManagerConfig = facebook::jsi::Object(rt);
        baseManagerConfig.setProperty(rt, "NativeProps", this->createNativeProps(rt));
        baseManagerConfig.setProperty(rt, "Constants", this->createConstants(rt));
        baseManagerConfig.setProperty(rt, "Commands", this->createCommands(rt));
        return baseManagerConfig;
    };

    virtual facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) {
        return facebook::jsi::Object(rt);
    }

    virtual facebook::jsi::Object createConstants(facebook::jsi::Runtime &rt) {
        return facebook::jsi::Object(rt);
    }

    virtual facebook::jsi::Object createCommands(facebook::jsi::Runtime &rt) {
        return facebook::jsi::Object(rt);
    }
};

} // namespace rnoh