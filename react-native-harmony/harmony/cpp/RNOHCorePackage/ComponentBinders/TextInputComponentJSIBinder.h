#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {

class TextInputComponentJSIBinder : public ViewComponentJSIBinder {
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto nativeProps = ViewComponentJSIBinder::createNativeProps(rt);
        
        nativeProps.setProperty(rt, "editable", "boolean");
        nativeProps.setProperty(rt, "caretHidden", "boolean");
        
        return nativeProps;
    };   
};

} // namespace rnoh