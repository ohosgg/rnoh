#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include <react/renderer/components/text/ParagraphState.h>
#include <react/renderer/components/text/ParagraphProps.h>
#include <react/renderer/core/ConcreteState.h>

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
                // NOTE: This is a temporary solution. Nesting <Text> component's won't work as expected.
                break;
            }
            return propsObjBuilder.build();
        }
        return napiViewProps;
    };
};

} // namespace rnoh
