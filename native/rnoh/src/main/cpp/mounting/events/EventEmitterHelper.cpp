#include <glog/logging.h>
#include <react/renderer/components/view/TouchEventEmitter.h>
#include <react/renderer/components/textinput/TextInputEventEmitter.h>

#include "EventEmitterHelper.h"
#include "TouchEventConversions.h"

namespace rnoh {

using namespace facebook::react;

void EventEmitterHelper::emitEvent(Tag tag, ReactEventKind eventKind, napi_value payload) {
    switch (eventKind) {
    case rnoh::ReactEventKind::TOUCH:
        this->emitTouchEvent(tag, payload);
        break;
    case rnoh::ReactEventKind::TEXT_INPUT_CHANGE:
        this->emitTextInputChangedEvent(tag, payload);
        break;
    default:
        LOG(FATAL) << "Unsupported event kind: " << eventKind;
    }
}

void EventEmitterHelper::emitTouchEvent(Tag tag, napi_value eventObject) {
    auto eventEmitter = eventEmitterRegistry->getEventEmitter<TouchEventEmitter>(tag);
    if (eventEmitter == nullptr) {
        return;
    }

    auto event = rnoh::convertTouchEvent(arkJs, tag, eventObject);
    auto eventType = (rnoh::TouchType)(arkJs.getDouble(arkJs.getObjectProperty(eventObject, "type")));

    switch (eventType) {
    case rnoh::TouchType::DOWN:
        eventEmitter->onTouchStart(event);
        break;
    case rnoh::TouchType::UP:
        eventEmitter->onTouchEnd(event);
        break;
    case rnoh::TouchType::MOVE:
        eventEmitter->onTouchMove(event);
        break;
    case rnoh::TouchType::CANCEL:
        eventEmitter->onTouchCancel(event);
        break;
    default:
        LOG(FATAL) << "Invalid touch event type received from Ark";
    }
}

void EventEmitterHelper::emitTextInputChangedEvent(facebook::react::Tag tag, napi_value payload) {
    auto eventEmitter = eventEmitterRegistry->getEventEmitter<TextInputEventEmitter>(tag);
    if (eventEmitter == nullptr) {
        return;
    }
    TextInputMetrics textInputMetrics{.text = arkJs.getString(payload)};
    eventEmitter->onChange(textInputMetrics);
}

} // namespace rnoh