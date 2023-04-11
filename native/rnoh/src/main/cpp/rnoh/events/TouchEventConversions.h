#pragma once

#include <napi/native_api.h>
#include <react/renderer/components/view/TouchEvent.h>

#include "RNOH/ArkJS.h"

namespace rnoh {

enum TouchType {
    DOWN,
    UP,
    MOVE,
    CANCEL
};

facebook::react::Touch convertTouchObject(ArkJS &arkJs, napi_value touchObject) {
    facebook::react::Tag id = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "id"));
    facebook::react::Float screenX = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "screenX"));
    facebook::react::Float screenY = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "screenY"));
    facebook::react::Float x = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "x"));
    facebook::react::Float y = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "y"));
    return facebook::react::Touch {
        .pagePoint = {.x = screenX, .y = screenY},
        .offsetPoint = {.x = x, .y = y},
        .screenPoint = {.x = screenX, .y = screenY},
        .identifier = id,
        .force = 1
    };
}

facebook::react::Touches convertTouches(ArkJS &arkJs, facebook::react::Tag tag, napi_value touchArray) {
    facebook::react::Touches touches;
    auto arrayLength = arkJs.getArrayLength(touchArray);
    for (int i=0; i < arrayLength; i++) {
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
    return facebook::react::TouchEvent {
        touches,
        changedTouches,
        touches
    };
}

} // namespace rnoh
