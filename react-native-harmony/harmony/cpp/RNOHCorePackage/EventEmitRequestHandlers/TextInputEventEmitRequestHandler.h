#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"
#include <react/renderer/components/textinput/TextInputEventEmitter.h>

namespace rnoh {

facebook::react::TextInputMetrics convertTextInputEvent(ArkJS &arkJs, napi_value eventObject) {
    facebook::react::TextInputMetrics textInputMetrics{.text = arkJs.getString(eventObject)};    
    return textInputMetrics;
}

facebook::react::KeyPressMetrics convertKeyPressEvent(ArkJS &arkJs, napi_value eventObject) {
    facebook::react::KeyPressMetrics keyPressMetrics{.text = arkJs.getString(eventObject)};
    return keyPressMetrics;
}

enum TextInputEventType {
    TEXT_INPUT_UNSUPPORTED,
    TEXT_INPUT_ON_CHANGE,
    TEXT_INPUT_ON_SUBMIT_EDITING,
    TEXT_INPUT_ON_FOCUS,
    TEXT_INPUT_ON_BLUR,
    TEXT_INPUT_ON_KEY_PRESS,
};

TextInputEventType getTextInputEventType(std::string const &eventName) {
    if (eventName == "TextInputChange") {
        return TextInputEventType::TEXT_INPUT_ON_CHANGE;
    } else if (eventName == "onSubmitEditing") {
        return TextInputEventType::TEXT_INPUT_ON_SUBMIT_EDITING;
    } else if (eventName == "onFocus") {
        return TextInputEventType::TEXT_INPUT_ON_FOCUS;
    } else if (eventName == "onBlur") {
        return TextInputEventType::TEXT_INPUT_ON_BLUR;
    } else if (eventName == "onKeyPress") {
        return TextInputEventType::TEXT_INPUT_ON_KEY_PRESS;
    } else {
        return TextInputEventType::TEXT_INPUT_UNSUPPORTED;
    }
}

class TextInputEventEmitRequestHandler : public EventEmitRequestHandler {
    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        auto eventType = getTextInputEventType(ctx.eventName);
        if (eventType == TextInputEventType::TEXT_INPUT_UNSUPPORTED) {
            return;
        }

        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<facebook::react::TextInputEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }

        ArkJS arkJs(ctx.env);
        switch (eventType) {
        case TextInputEventType::TEXT_INPUT_ON_CHANGE:
            eventEmitter->onChange(convertTextInputEvent(arkJs, ctx.payload));
            break;
        case TextInputEventType::TEXT_INPUT_ON_SUBMIT_EDITING:
            eventEmitter->onSubmitEditing(convertTextInputEvent(arkJs, ctx.payload));
            break;
        case TextInputEventType::TEXT_INPUT_ON_FOCUS:
            eventEmitter->onFocus(convertTextInputEvent(arkJs, ctx.payload));
            break;
        case TextInputEventType::TEXT_INPUT_ON_BLUR:
            eventEmitter->onBlur(convertTextInputEvent(arkJs, ctx.payload));
            break;
        case TextInputEventType::TEXT_INPUT_ON_KEY_PRESS:
            eventEmitter->onKeyPress(convertKeyPressEvent(arkJs, ctx.payload));
            break;
        default:
            break;
        }
    }
};

} // namespace rnoh