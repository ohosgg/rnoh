#pragma once
#include "RNOH/BaseComponentNapiBinder.h"
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include <react/renderer/components/modal/ModalHostViewShadowNode.h>

namespace rnoh {

class ModalHostViewNapiBinder : public ViewComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        ArkJS arkJs(env);
        auto modalProps = std::dynamic_pointer_cast<const facebook::react::ModalHostViewProps>(shadowView.props);
        if (!modalProps) {
            LOG(ERROR) << "ModalHostViewNapiBinder::createProps: props is not ModalHostViewProps";
            return arkJs.getUndefined();
        }

        napi_value napiBaseProps = ViewComponentNapiBinder::createProps(env, shadowView);
        auto propsBuilder = arkJs.getObjectBuilder(napiBaseProps);

        propsBuilder.addProperty("transparent", modalProps->transparent)
            .addProperty("visible", modalProps->visible)
            .addProperty("identifier", modalProps->identifier);

        return propsBuilder.build();
    };

    napi_value createState(napi_env env, facebook::react::ShadowView const shadowView) override {
        ArkJS arkJs(env);
        auto modalState = std::dynamic_pointer_cast<const facebook::react::ConcreteState<facebook::react::ModalHostViewState>>(shadowView.state);
        if (!modalState) {
            LOG(ERROR) << "ModalHostViewNapiBinder::createState: state is not ModalHostViewState";
            return arkJs.getUndefined();
        }

        auto data = modalState->getData();

        napi_value napiBaseState = ViewComponentNapiBinder::createState(env, shadowView);
        auto stateBuilder = arkJs.getObjectBuilder(napiBaseState);
        auto screenSizeBuilder = arkJs.createObjectBuilder();
        screenSizeBuilder
            .addProperty("width", data.screenSize.width)
            .addProperty("height", data.screenSize.height);

        return stateBuilder
            .addProperty("screenSize", screenSizeBuilder.build())
            .build();
    }

    void updateState(StateUpdateContext const &ctx) override {
        auto [env, state, newState] = ctx;
        ArkJS arkJs(env);
        auto modalState = std::dynamic_pointer_cast<facebook::react::ConcreteState<facebook::react::ModalHostViewState> const>(state);
        if (modalState == nullptr) {
            return;
        }
        auto screenSize = arkJs.getObjectProperty(newState, "screenSize");
        auto width = arkJs.getObjectProperty(screenSize, "width");
        auto height = arkJs.getObjectProperty(screenSize, "height");
        facebook::react::ModalHostViewState data(facebook::react::Size{
            (facebook::react::Float)arkJs.getDouble(width),
            (facebook::react::Float)arkJs.getDouble(height)});
        modalState->updateState(std::move(data));
        return;
    }
};

} // namespace rnoh
