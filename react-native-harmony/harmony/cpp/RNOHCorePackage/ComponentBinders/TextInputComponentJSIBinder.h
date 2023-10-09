#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {

class TextInputComponentJSIBinder : public ViewComponentJSIBinder {
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto nativeProps = ViewComponentJSIBinder::createNativeProps(rt);
        nativeProps.setProperty(rt, "editable", "boolean");
        nativeProps.setProperty(rt, "caretHidden", "boolean");
        nativeProps.setProperty(rt, "secureTextEntry", "boolean");
        nativeProps.setProperty(rt, "maxLength", "number");
        nativeProps.setProperty(rt, "selectionColor", "Color");

        return nativeProps;
    };
};

} // namespace rnoh