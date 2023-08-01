#pragma once
#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"
#include <react/renderer/components/rncore/EventEmitters.h>

namespace rnoh {

facebook::react::SwitchEventEmitter::OnChange convertSwitchEvent(ArkJS &arkJs, napi_value eventObject) {
    auto value = arkJs.getBoolean(arkJs.getObjectProperty(eventObject, "value"));
    auto target = arkJs.getInteger(arkJs.getObjectProperty(eventObject, "target"));

    return {value, target};
}

class SwitchEventEmitRequestHandler : public EventEmitRequestHandler {
    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        if (ctx.eventName != "onChange") {
            return;
        }

        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<facebook::react::SwitchEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }

        ArkJS arkJs(ctx.env);
        auto event = convertSwitchEvent(arkJs, ctx.payload);
        eventEmitter->onChange(event);
    }
};

} // namespace rnoh