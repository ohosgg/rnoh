#pragma once
#include "RNOH/EventEmitRequestHandler.h"
#include <react/renderer/components/rncore/EventEmitters.h>

namespace rnoh {

class ImageEventEmitRequestHandler : public EventEmitRequestHandler {
    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        if (ctx.eventName != "loadStart") {
            return;
        }

        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<facebook::react::ImageEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }

        eventEmitter->onLoadStart();
    }
};

} // namespace rnoh