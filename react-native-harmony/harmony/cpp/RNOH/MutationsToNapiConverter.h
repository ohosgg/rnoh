#pragma once

#include <react/renderer/mounting/ShadowViewMutation.h>

#include "RNOH/ArkJS.h"

namespace rnoh {

class ComponentNapiBinder {
  public:
    virtual napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) {
        return ArkJS(env).createObjectBuilder().build();
    };
    virtual napi_value createState(napi_env env, facebook::react::ShadowView const shadowView) {
        return ArkJS(env).createObjectBuilder().build();
    };
};

using ComponentNapiBinderByString = std::unordered_map<std::string, std::shared_ptr<ComponentNapiBinder>>;

class MutationsToNapiConverter {
  public:
    MutationsToNapiConverter(ComponentNapiBinderByString &&componentNapiBinderByName);

    napi_value convert(napi_env env, facebook::react::ShadowViewMutationList const &mutations);

  private:
    napi_value convertShadowView(napi_env env, facebook::react::ShadowView const shadowView);

    ComponentNapiBinderByString m_componentNapiBinderByName;
};

} // namespace rnoh