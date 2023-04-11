#include <glog/logging.h>
#include <react/renderer/components/view/TouchEventEmitter.h>
#include <react/renderer/components/textinput/TextInputEventEmitter.h>

#include "RNOH/events/EventEmitterHelper.h"
#include "RNOH/events/TouchEventConversions.h"

namespace rnoh {

using namespace facebook;

void EventEmitterHelper::emitEvent(react::Tag tag, ReactEventKind eventKind, napi_value payload) {
    switch (eventKind) {
    case ReactEventKind::TOUCH:
        this->emitTouchEvent(tag, payload);
        break;
    case ReactEventKind::TEXT_INPUT_CHANGE:
        this->emitTextInputChangedEvent(tag, payload);
        break;
    default:
        LOG(FATAL) << "Unsupported event kind: " << eventKind;
    }
}

void EventEmitterHelper::emitTouchEvent(react::Tag tag, napi_value eventObject) {
    auto eventEmitter = eventEmitterRegistry->getEventEmitter<react::TouchEventEmitter>(tag);
    if (eventEmitter == nullptr) {
        return;
    }

    auto event = convertTouchEvent(arkJs, tag, eventObject);
    auto eventType = (TouchType)(arkJs.getDouble(arkJs.getObjectProperty(eventObject, "type")));

    switch (eventType) {
    case TouchType::DOWN:
        eventEmitter->onTouchStart(event);
        break;
    case TouchType::UP:
        eventEmitter->onTouchEnd(event);
        break;
    case TouchType::MOVE:
        eventEmitter->onTouchMove(event);
        break;
    case TouchType::CANCEL:
        eventEmitter->onTouchCancel(event);
        break;
    default:
        LOG(FATAL) << "Invalid touch event type received from Ark";
    }
}

void EventEmitterHelper::emitTextInputChangedEvent(facebook::react::Tag tag, napi_value payload) {
    auto eventEmitter = eventEmitterRegistry->getEventEmitter<react::TextInputEventEmitter>(tag);
    if (eventEmitter == nullptr) {
        return;
    }
    react::TextInputMetrics textInputMetrics{.text = arkJs.getString(payload)};
    eventEmitter->onChange(textInputMetrics);
}

} // namespace rnoh