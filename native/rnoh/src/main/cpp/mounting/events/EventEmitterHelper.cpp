#include <glog/logging.h>
#include <react/renderer/components/view/TouchEventEmitter.h>

#include "EventEmitterHelper.h"
#include "TouchEventConversions.h"

namespace rnoh {

using namespace facebook::react;

void EventEmitterHelper::emitEvent(facebook::react::Tag tag, ReactEventKind eventKind, napi_value eventObject) {
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

} // namespace rnoh