#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include <react/renderer/components/text/ParagraphState.h>
#include <react/renderer/components/text/ParagraphProps.h>
#include <react/renderer/core/ConcreteState.h>
#define EnumToString(x) #x

namespace rnoh {

class TextComponentNapiBinder : public ViewComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiViewProps = ViewComponentNapiBinder::createProps(env, shadowView);
        if (auto state = std::dynamic_pointer_cast<const react::ConcreteState<react::ParagraphState>>(shadowView.state)) {
            auto data = state->getData();
            ArkJS arkJs(env);
            auto propsObjBuilder = arkJs.getObjectBuilder(napiViewProps);
            propsObjBuilder.addProperty("text", data.attributedString.getString());
            for (auto fragment : data.attributedString.getFragments()) {
                auto textAttributes = fragment.textAttributes;
                propsObjBuilder
                    .addProperty("fontColor", textAttributes.foregroundColor)
                    .addProperty("fontSize", textAttributes.fontSize);
                auto fontWeight = textAttributes.fontWeight;
                if (fontWeight.has_value()) {
                    propsObjBuilder.addProperty("fontWeight", static_cast<int>(fontWeight.value()));
                }
                auto textAlign = textAttributes.alignment;
                if (textAlign.has_value()) {
                    propsObjBuilder.addProperty("textAlign", textAlignmentToString(textAlign.value()));
                }
                // NOTE: This is a temporary solution. Nesting <Text> component's won't work as expected.
                break;
            }
            return propsObjBuilder.build();
        }
        return napiViewProps;
    };

  private:
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
    }
};

} // namespace rnoh
