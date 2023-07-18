#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"
#include <react/renderer/components/textinput/TextInputEventEmitter.h>

namespace rnoh {

class TextInputChangeEventEmitRequestHandler : public EventEmitRequestHandler {
    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        if (ctx.eventName != "TextInputChange") {
            return;
        }

        ArkJS arkJs(ctx.env);
        auto eventEmitter = ctx.eventEmitterRegistry->getEventEmitter<facebook::react::TextInputEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }
        facebook::react::TextInputMetrics textInputMetrics{.text = arkJs.getString(ctx.payload)};
        eventEmitter->onChange(textInputMetrics);
    }
};

} // namespace rnoh