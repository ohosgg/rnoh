#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include <react/renderer/components/rncore/Props.h>

namespace rnoh {

class ActivityIndicatorComponentNapiBinder : public ViewComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        ArkJS arkJs(env);
        auto activityIndicatorProps = std::dynamic_pointer_cast<const facebook::react::ActivityIndicatorViewProps>(shadowView.props);
        if (!activityIndicatorProps) {
            LOG(ERROR) << "ActivityIndicatorComponentNapiBinder::createProps: props is not ActivityIndicatorViewProps";
            return arkJs.getUndefined();
        }

        napi_value napiBaseProps = ViewComponentNapiBinder::createProps(env, shadowView);
        auto propsBuilder = arkJs.getObjectBuilder(napiBaseProps);
        
        propsBuilder.addProperty("animating", activityIndicatorProps->animating)
        .addProperty("color", activityIndicatorProps->color);

        return propsBuilder.build();
    };
};

} // namespace rnoh
