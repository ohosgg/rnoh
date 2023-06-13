#pragma once
#include "RNOH/BaseComponentNapiBinder.h"
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/graphics/platform/cxx/react/renderer/graphics/Color.h>

namespace rnoh {

class ViewComponentNapiBinder : public BaseComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiBaseProps = BaseComponentNapiBinder::createProps(env, shadowView);
        if (auto props = std::dynamic_pointer_cast<const react::ViewProps>(shadowView.props)) {
            auto borderMetrics = props->resolveBorderMetrics(shadowView.layoutMetrics);
            auto rawProps = shadowView.props->rawProps;

            return ArkJS(env)
                .getObjectBuilder(napiBaseProps)
                .addProperty("backgroundColor", props->backgroundColor)
                .addProperty("opacity", props->opacity)
                .addProperty("borderWidth", borderMetrics.borderWidths.top)
                .addProperty("borderColor", borderMetrics.borderColors.top)
                .addProperty("borderRadius", borderMetrics.borderRadii.topLeft)
                .build();
        }
        return napiBaseProps;
    };
};

} // namespace rnoh
