#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {

class TextInputComponentJSIBinder : public ViewComponentJSIBinder {
    facebook::jsi::Object createNativeProps(facebook::jsi::Runtime &rt) override {
        auto nativeProps = ViewComponentJSIBinder::createNativeProps(rt);
        nativeProps.setProperty(rt, "text", "string");
        nativeProps.setProperty(rt, "editable", "boolean");
        nativeProps.setProperty(rt, "multiline", "boolean");
        nativeProps.setProperty(rt, "placeholder", "string");
        nativeProps.setProperty(rt, "placeholderTextColor", "Color");
        nativeProps.setProperty(rt, "caretHidden", "boolean");
        nativeProps.setProperty(rt, "secureTextEntry", "boolean");
        nativeProps.setProperty(rt, "maxLength", "number");
        nativeProps.setProperty(rt, "selectionColor", "Color");
        nativeProps.setProperty(rt, "returnKeyType", "ReturnKeyType");
        nativeProps.setProperty(rt, "textAlign", "string");
        nativeProps.setProperty(rt, "autoFocus", "boolean");
        nativeProps.setProperty(rt, "keyboardType", "KeyboardType");
        nativeProps.setProperty(rt, "clearTextOnFocus", "boolean");

        return nativeProps;
    };
    facebook::jsi::Object createDirectEventTypes(facebook::jsi::Runtime &rt) override {
        facebook::jsi::Object events(rt);

        events.setProperty(rt, "topSubmitEditing", createDirectEvent(rt, "onSubmitEditing"));
        events.setProperty(rt, "topFocus", createDirectEvent(rt, "onFocus"));
        events.setProperty(rt, "topBlur", createDirectEvent(rt, "onBlur"));
        events.setProperty(rt, "topKeyPress", createDirectEvent(rt, "onKeyPress"));

        return events;
    }
};

} // namespace rnoh