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
        if (auto state = std::dynamic_pointer_cast<const facebook::react::ConcreteState<facebook::react::ParagraphState>>(shadowView.state)) {
            auto data = state->getData();
            ArkJS arkJs(env);
            auto propsObjBuilder = arkJs.getObjectBuilder(napiViewProps);
            auto fragmentsPayload = std::vector<napi_value>();
            auto fragments = data.attributedString.getFragments();
            
            if (auto props = std::dynamic_pointer_cast<const facebook::react::BaseTextProps>(shadowView.props)) {
                auto textAlign = props->textAttributes.alignment;   
                if (textAlign.has_value()) {
                    propsObjBuilder.addProperty("textAlign", textAlignmentToString(textAlign.value()));
                }
            }
            
            for (auto fragment : fragments) {
                auto fragmentObjBuilder = arkJs.createObjectBuilder();
                auto textAttributes = fragment.textAttributes;
                fragmentObjBuilder
                    .addProperty("text", fragment.string)
                    .addProperty("fontColor", textAttributes.foregroundColor)
                    .addProperty("fontSize", textAttributes.fontSize);
                auto fontWeight = textAttributes.fontWeight;
                if (fontWeight.has_value()) {
                    fragmentObjBuilder.addProperty("fontWeight", static_cast<int>(fontWeight.value()));
                }
                auto textAlign = textAttributes.alignment;
                if (textAttributes.fontStyle == facebook::react::FontStyle::Italic) {
                    fragmentObjBuilder.addProperty("fontStyle", "italic");
                } else {
                    fragmentObjBuilder.addProperty("fontStyle", "normal");
                }
                fragmentsPayload.push_back(fragmentObjBuilder.build());
            }
            auto fragmentsArray = arkJs.createArray(fragmentsPayload);
            propsObjBuilder.addProperty("fragments", fragmentsArray);
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
