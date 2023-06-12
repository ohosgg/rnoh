#pragma once
#include <napi/native_api.h>
#include <react/renderer/components/view/TouchEvent.h>
#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"

namespace rnoh {

enum TouchType {
    DOWN,
    UP,
    MOVE,
    CANCEL
};

class TouchEventEmitRequestHandler : public EventEmitRequestHandler {
  public:
    void handleEvent(TouchEventEmitRequestHandler::Context ctx) override {
        ArkJS arkJs(ctx.env);
        auto eventEmitter = ctx.eventEmitterRegistry->getEventEmitter<react::TouchEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }

        auto event = convertTouchEvent(arkJs, ctx.tag, ctx.payload);
        auto eventType = (TouchType)(arkJs.getDouble(arkJs.getObjectProperty(ctx.payload, "type")));

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
    };

  private:
    facebook::react::Touch convertTouchObject(ArkJS &arkJs, napi_value touchObject) {
        facebook::react::Tag id = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "id"));
        facebook::react::Float screenX = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "screenX"));
        facebook::react::Float screenY = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "screenY"));
        facebook::react::Float x = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "x"));
        facebook::react::Float y = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "y"));
        return facebook::react::Touch{
            .pagePoint = {.x = screenX, .y = screenY},
            .offsetPoint = {.x = x, .y = y},
            .screenPoint = {.x = screenX, .y = screenY},
            .identifier = id,
            .force = 1};
    }

    facebook::react::Touches convertTouches(ArkJS &arkJs, facebook::react::Tag tag, napi_value touchArray) {
        facebook::react::Touches touches;
        auto arrayLength = arkJs.getArrayLength(touchArray);
        for (int i = 0; i < arrayLength; i++) {
            auto touchObject = arkJs.getArrayElement(touchArray, i);
            auto touch = convertTouchObject(arkJs, touchObject);
            touch.target = tag;
            touches.insert(std::move(touch));
        }
        return touches;
    }

    facebook::react::TouchEvent convertTouchEvent(ArkJS &arkJs, facebook::react::Tag tag, napi_value touchEvent) {
        auto touches = convertTouches(arkJs, tag, arkJs.getObjectProperty(touchEvent, "touches"));
        auto changedTouches = convertTouches(arkJs, tag, arkJs.getObjectProperty(touchEvent, "changedTouches"));
        auto timestamp = arkJs.getDouble(arkJs.getObjectProperty(touchEvent, "timestamp"));
        return facebook::react::TouchEvent{
            touches,
            changedTouches,
            touches};
    }
};

} // namespace rnoh