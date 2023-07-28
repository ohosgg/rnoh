#pragma once

#include <glog/logging.h>
#include <react/renderer/components/rncore/EventEmitters.h>

#include "RNOH/EventEmitRequestHandler.h"

namespace rnoh {

class ModalEventEmitRequestHandler : public EventEmitRequestHandler {
public:
    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        auto eventName = ctx.eventName;
        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<facebook::react::ModalHostViewEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }

        if (eventName == "onShow") {
            eventEmitter->onShow({});
        } else if (eventName == "onDismiss") {
            eventEmitter->onDismiss({});
        } else if (eventName == "onRequestClose") {
            eventEmitter->onRequestClose({});
        } else {
            LOG(ERROR) << "Unsupported modal event name: " << eventName;
        }
    }
};

} // namespace rnoh
