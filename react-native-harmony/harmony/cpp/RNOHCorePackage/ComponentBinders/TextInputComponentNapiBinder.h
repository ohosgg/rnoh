#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include <react/renderer/components/text/ParagraphState.h>
#include <react/renderer/components/text/ParagraphProps.h>
#include <react/renderer/core/ConcreteState.h>
#include <react/renderer/components/textinput/TextInputProps.h>

namespace rnoh {

class TextInputComponentNapiBinder : public ViewComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiViewProps = ViewComponentNapiBinder::createProps(env, shadowView);
        if (auto props = std::dynamic_pointer_cast<const facebook::react::TextInputProps>(shadowView.props)) {
            return ArkJS(env)
                .getObjectBuilder(napiViewProps)
                .addProperty("text", props->text)
                .addProperty("fontColor", props->textAttributes.foregroundColor)
                .addProperty("fontSize", props->textAttributes.fontSize)
                .addProperty("multiline", props->traits.multiline)
                .addProperty("placeholder", props->placeholder)
                .addProperty("placeholderTextColor", props->placeholderTextColor)
                .addProperty("editable", props->traits.editable)
                .addProperty("caretHidden", props->traits.caretHidden)
                .addProperty("secureTextEntry", props->traits.secureTextEntry)
                .addProperty("selectionColor", props->selectionColor)
                .addProperty("returnKeyType", returnKeyTypeToString(props->traits.returnKeyType))
                .build();
        }
        return napiViewProps;
    };

  private:
    std::string returnKeyTypeToString(facebook::react::ReturnKeyType returnKeyType) {
        switch (returnKeyType) {
        case facebook::react::ReturnKeyType::Done:
            return "done";
        case facebook::react::ReturnKeyType::Go:
            return "go";
        case facebook::react::ReturnKeyType::Next:
            return "next";
        case facebook::react::ReturnKeyType::Search:
            return "search";
        case facebook::react::ReturnKeyType::Send:
            return "send";
        default:
            return "default";
        }
    }
};

} // namespace rnoh
