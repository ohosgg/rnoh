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
            auto textAlign = props->textAttributes.alignment;
            std::string alignment = "";
            if (textAlign.has_value()) {
                alignment = textAlignmentToString(textAlign.value());
            }
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
                .addProperty("textAlign", alignment)
                .addProperty("autoFocus", props->autoFocus)
                .addProperty("keyboardType", keyboardTypeToString(props->traits.keyboardType))
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
    };

    std::string textAlignmentToString(facebook::react::TextAlignment alignment) {
        switch (alignment) {
        case facebook::react::TextAlignment::Natural:
            return "natural";
        case facebook::react::TextAlignment::Left:
            return "left";
        case facebook::react::TextAlignment::Right:
            return "right";
        case facebook::react::TextAlignment::Center:
            return "center";
        case facebook::react::TextAlignment::Justified:
            return "justified";
        }
    };

    std::string keyboardTypeToString(facebook::react::KeyboardType keyboardType) {
        switch (keyboardType) {
        case facebook::react::KeyboardType::EmailAddress:
            return "emailAddress";
        case facebook::react::KeyboardType::Numeric:
            return "numeric";
        case facebook::react::KeyboardType::PhonePad:
            return "phonePad";
        case facebook::react::KeyboardType::NumberPad:
            return "numberPad";
        case facebook::react::KeyboardType::DecimalPad:
            return "decimalPad";
        default:
            return "default";
        }
    }
};

} // namespace rnoh
