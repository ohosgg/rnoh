#pragma once

#include <napi/native_api.h>
#include <react/renderer/components/view/TouchEvent.h>

#include "rnoh/ArkJS.h"

namespace rnoh {
using namespace facebook::react;

enum TouchType {
    DOWN,
    UP,
    MOVE,
    CANCEL
};

Touch convertTouchObject(ArkJS &arkJs, napi_value touchObject) {
    Tag id = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "id"));
    Float screenX = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "screenX"));
    Float screenY = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "screenY"));
    Float x = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "x"));
    Float y = arkJs.getDouble(arkJs.getObjectProperty(touchObject, "y"));
    return Touch {
        .pagePoint = {.x = screenX, .y = screenY},
        .offsetPoint = {.x = x, .y = y},
        .screenPoint = {.x = screenX, .y = screenY},
        .identifier = id,
        .force = 1
    };
}

Touches convertTouches(ArkJS &arkJs, Tag tag, napi_value touchArray) {
    Touches touches;
    auto arrayLength = arkJs.getArrayLength(touchArray);
    for (int i=0; i < arrayLength; i++) {
        auto touchObject = arkJs.getArrayElement(touchArray, i);
        auto touch = convertTouchObject(arkJs, touchObject);
        touch.target = tag;
        touches.insert(std::move(touch));
    }
    return touches;
}

TouchEvent convertTouchEvent(ArkJS &arkJs, Tag tag, napi_value touchEvent) {
    auto touches = convertTouches(arkJs, tag, arkJs.getObjectProperty(touchEvent, "touches"));
    auto changedTouches = convertTouches(arkJs, tag, arkJs.getObjectProperty(touchEvent, "changedTouches"));
    auto timestamp = arkJs.getDouble(arkJs.getObjectProperty(touchEvent, "timestamp"));
    return TouchEvent {
        touches,
        changedTouches,
        touches
    };
}

} // namespace rnoh
