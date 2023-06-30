#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include <react/renderer/components/scrollview/ScrollViewState.h>
#include <react/renderer/components/scrollview/ScrollViewProps.h>
#include <react/renderer/core/ConcreteState.h>

namespace rnoh {

class ScrollViewComponentNapiBinder : public ViewComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiViewProps = ViewComponentNapiBinder::createProps(env, shadowView);
        if (auto props = std::dynamic_pointer_cast<const facebook::react::ScrollViewProps>(shadowView.props)) {
            ArkJS(env)
                .getObjectBuilder(napiViewProps)
                .addProperty("contentOffsetX", props->contentOffset.x)
                .addProperty("contentOffsetY", props->contentOffset.y)
                .addProperty("scrollEnabled", props->scrollEnabled)
                .addProperty("bounces", props->bounces)
                .addProperty("showsHorizontalScrollIndicator", props->showsHorizontalScrollIndicator)
                .addProperty("showsVerticalScrollIndicator", props->showsVerticalScrollIndicator)
                .build();
        }
        return napiViewProps;
    };

    napi_value createState(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiViewState = ViewComponentNapiBinder::createState(env, shadowView);
        if (auto state = std::dynamic_pointer_cast<const facebook::react::ConcreteState<facebook::react::ScrollViewState>>(shadowView.state)) {
            auto data = state->getData();
            ArkJS(env)
                .getObjectBuilder(napiViewState)
                .addProperty("contentOffsetX", data.contentOffset.x)
                .addProperty("contentOffsetY", data.contentOffset.y)
                .addProperty("contentSizeWidth", data.getContentSize().width)
                .addProperty("contentSizeHeight", data.getContentSize().height)
                .build();
        }
        return napiViewState;
    };
};

} // namespace rnoh
