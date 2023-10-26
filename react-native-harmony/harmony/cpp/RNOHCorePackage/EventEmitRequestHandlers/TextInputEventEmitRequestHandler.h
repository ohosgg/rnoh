#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"
#include <react/renderer/components/textinput/TextInputEventEmitter.h>

namespace rnoh {

facebook::react::TextInputMetrics convertTextInputEvent(ArkJS &arkJs, napi_value eventObject) {
    facebook::react::TextInputMetrics textInputMetrics{.text = arkJs.getString(eventObject)};    
    return textInputMetrics;
}

class TextInputEventEmitRequestHandler : public EventEmitRequestHandler {
    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        if (ctx.eventName != "TextInputChange" && ctx.eventName != "onSubmitEditing" && ctx.eventName != "onFocus" && ctx.eventName != "onBlur") {
            return;
        }

        ArkJS arkJs(ctx.env);
        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<facebook::react::TextInputEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }
        if (ctx.eventName == "TextInputChange") {
            eventEmitter->onChange(convertTextInputEvent(arkJs, ctx.payload));
        }
        else if (ctx.eventName == "onSubmitEditing") {
            eventEmitter->onSubmitEditing(convertTextInputEvent(arkJs, ctx.payload));
        }
        else if (ctx.eventName == "onFocus") {
            eventEmitter->onFocus(convertTextInputEvent(arkJs, ctx.payload));
        }
        else if (ctx.eventName == "onBlur") {
            eventEmitter->onBlur(convertTextInputEvent(arkJs, ctx.payload));
        }
        

    }
};

} // namespace rnoh