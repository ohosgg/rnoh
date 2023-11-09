#pragma once
#include "RNOH/MutationsToNapiConverter.h"
#include <react/renderer/components/view/ViewProps.h>

namespace rnoh {

class BaseComponentNapiBinder : public ComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        auto propsBuilder = ArkJS(env).createObjectBuilder();
        if (auto props = std::dynamic_pointer_cast<const facebook::react::ViewProps>(shadowView.props)) {
            propsBuilder.addProperty("transform", props->transform.matrix);
        }
        return propsBuilder.build();
    }
};

} // namespace rnoh