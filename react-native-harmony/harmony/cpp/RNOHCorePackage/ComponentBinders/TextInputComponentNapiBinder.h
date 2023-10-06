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
                .addProperty("editable", props->traits.editable)
                .build();
        }
        return napiViewProps;
    };
};

} // namespace rnoh
