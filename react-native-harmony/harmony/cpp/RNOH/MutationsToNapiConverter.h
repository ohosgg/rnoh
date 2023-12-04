#pragma once

#include <react/renderer/mounting/ShadowViewMutation.h>

#include "RNOH/ArkJS.h"

namespace rnoh {

class ComponentNapiBinder {
  public:
    struct StateUpdateContext {
        napi_env env;
        facebook::react::State::Shared state;
        napi_value newState;
    };

    virtual napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) {
        return ArkJS(env).createObjectBuilder().build();
    };
    virtual napi_value createState(napi_env env, facebook::react::ShadowView const shadowView) {
        return ArkJS(env).createObjectBuilder().build();
    };
    virtual void updateState(ComponentNapiBinder::StateUpdateContext const &ctx) {
        return;
    };
};

using ComponentNapiBinderByString = std::unordered_map<std::string, std::shared_ptr<ComponentNapiBinder>>;

class MutationsToNapiConverter {
  public:
    MutationsToNapiConverter(ComponentNapiBinderByString &&componentNapiBinderByName);

    napi_value convert(
        napi_env env,
        std::unordered_map<facebook::react::Tag, folly::dynamic> &prellocatedViewRawPropsByTag,
        facebook::react::ShadowViewMutationList const &mutations);

    void updateState(napi_env env, std::string const &componentName, facebook::react::State::Shared const &state, napi_value newState);

  private:
    napi_value convertShadowView(napi_env env, facebook::react::ShadowView const shadowView, folly::dynamic &&rawPropsToMerge = folly::dynamic::object());

    ComponentNapiBinderByString m_componentNapiBinderByName;
};

} // namespace rnoh