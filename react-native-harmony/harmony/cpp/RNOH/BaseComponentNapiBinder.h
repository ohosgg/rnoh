#pragma once
#include "RNOH/MutationsToNapiConverter.h"

namespace rnoh {

class BaseComponentNapiBinder : public ComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        return ArkJS(env)
            .createObjectBuilder()
            .build();
    }
};

} // namespace rnoh