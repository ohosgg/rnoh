#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include <react/renderer/components/rncore/Props.h>

namespace rnoh {

class SwitchComponentNapiBinder : public ViewComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        ArkJS arkJs(env);
        auto switchProps = std::dynamic_pointer_cast<const facebook::react::SwitchProps>(shadowView.props);
        if (!switchProps) {
            LOG(ERROR) << "SwitchComponentNapiBinder::createProps: props is not SwitchProps";
            return arkJs.getUndefined();
        }

        napi_value napiBaseProps = ViewComponentNapiBinder::createProps(env, shadowView);
        auto propsBuilder = arkJs.getObjectBuilder(napiBaseProps);

        propsBuilder.addProperty("trackColor", switchProps->onTintColor)
            .addProperty("thumbColor", switchProps->thumbTintColor)
            .addProperty("value", switchProps->value)
            .addProperty("disabled", switchProps->disabled);
        return propsBuilder.build();
    };
};

} // namespace rnoh
