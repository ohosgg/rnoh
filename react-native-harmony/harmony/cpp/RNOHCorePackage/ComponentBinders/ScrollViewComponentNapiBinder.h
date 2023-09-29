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
            auto rawProps = shadowView.props->rawProps;

            auto persistentScrollbar = false;

            if (rawProps.count("persistentScrollbar") > 0) {
                persistentScrollbar = rawProps["persistentScrollbar"].asBool();
            }

            ArkJS(env)
                .getObjectBuilder(napiViewProps)
                .addProperty("contentOffsetX", props->contentOffset.x)
                .addProperty("contentOffsetY", props->contentOffset.y)
                .addProperty("scrollEnabled", props->scrollEnabled)
                .addProperty("bounces", props->bounces)
                .addProperty("showsHorizontalScrollIndicator", props->showsHorizontalScrollIndicator)
                .addProperty("showsVerticalScrollIndicator", props->showsVerticalScrollIndicator)
                .addProperty("flexDirection", props->yogaStyle.flexDirection())
                .addProperty("persistentScrollbar", persistentScrollbar)
                .addProperty("indicatorStyle", static_cast<int>(props->indicatorStyle))
                .addProperty("decelerationRate", props->decelerationRate)
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

    void updateState(StateUpdateContext const &ctx) override {
        ArkJS arkJs(ctx.env);
        auto scrollState = std::dynamic_pointer_cast<facebook::react::ConcreteState<facebook::react::ScrollViewState> const>(ctx.state);
        if (scrollState == nullptr) {
            return;
        }

        auto contentOffsetX = arkJs.getObjectProperty(ctx.newState, "contentOffsetX");
        auto contentOffsetY = arkJs.getObjectProperty(ctx.newState, "contentOffsetY");
        auto contentOffset = facebook::react::Point{
            (facebook::react::Float)arkJs.getDouble(contentOffsetX),
            (facebook::react::Float)arkJs.getDouble(contentOffsetY)};

        // we want to keep the one calculated by RN, so don't update it
        auto contentBoundingRect = scrollState->getData().contentBoundingRect;

        facebook::react::ScrollViewState data{contentOffset, contentBoundingRect};
        scrollState->updateState(std::move(data));
        return;
    };
};

} // namespace rnoh
