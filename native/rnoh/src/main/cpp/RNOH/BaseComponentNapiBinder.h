#pragma once
#include "RNOH/MutationsToNapiConverter.h"

namespace rnoh {

class BaseComponentNapiBinder : public ComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        return ArkJS(env)
            .createObjectBuilder()
            .addProperty("top", shadowView.layoutMetrics.frame.origin.y)
            .addProperty("left", shadowView.layoutMetrics.frame.origin.x)
            .addProperty("width", shadowView.layoutMetrics.frame.size.width)
            .addProperty("height", shadowView.layoutMetrics.frame.size.height)
            .build();
    }
};

} // namespace rnoh