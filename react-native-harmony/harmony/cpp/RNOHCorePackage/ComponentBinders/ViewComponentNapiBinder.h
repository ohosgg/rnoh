#pragma once
#include "RNOH/BaseComponentNapiBinder.h"
#include <react/renderer/components/view/ViewProps.h>
namespace rnoh {

class ViewComponentNapiBinder : public BaseComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiBaseProps = BaseComponentNapiBinder::createProps(env, shadowView);
        if (auto props = std::dynamic_pointer_cast<const react::ViewProps>(shadowView.props)) {
            auto borderMetrics = props->resolveBorderMetrics(shadowView.layoutMetrics);
            auto rawProps = shadowView.props->rawProps;

            auto backgroundColor = 0;
            if (rawProps.count("backgroundColor") > 0) {
                backgroundColor = rawProps["backgroundColor"].asInt();
            }

            auto borderColor = 0;
            if (rawProps.count("borderColor") > 0) {
                borderColor = rawProps["borderColor"].asInt();
            }

            return ArkJS(env)
                .getObjectBuilder(napiBaseProps)
                .addProperty("backgroundColor", backgroundColor)
                .addProperty("opacity", props->opacity)
                .addProperty("borderWidth", borderMetrics.borderWidths.top)
                .addProperty("borderColor", borderColor)
                .addProperty("borderRadius", borderMetrics.borderRadii.topLeft)
                .build();
        }
        return napiBaseProps;
    };
};

} // namespace rnoh
