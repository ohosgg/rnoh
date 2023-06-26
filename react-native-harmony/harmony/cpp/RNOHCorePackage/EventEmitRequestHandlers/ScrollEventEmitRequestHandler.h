#pragma once
#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"
#include <react/renderer/components/scrollview/ScrollViewEventEmitter.h>

namespace rnoh {

enum ScrollEventType {
    BEGIN_DRAG = 0,
    END_DRAG = 1,
    BEGIN_MOMENTUM = 2,
    END_MOMENTUM = 3,
    SCROLLING = 4
};

facebook::react::ScrollViewMetrics convertScrollEvent(ArkJS &arkJs, napi_value eventObject) {
    return {
        .contentSize = {
            (float)arkJs.getDouble(arkJs.getObjectProperty(eventObject, "contentWidth")),
            (float)arkJs.getDouble(arkJs.getObjectProperty(eventObject, "contentHeight"))},
        .contentOffset = {(float)arkJs.getDouble(arkJs.getObjectProperty(eventObject, "contentOffsetX")), (float)arkJs.getDouble(arkJs.getObjectProperty(eventObject, "contentOffsetY"))},
        .containerSize = {(float)arkJs.getDouble(arkJs.getObjectProperty(eventObject, "containerWidth")), (float)arkJs.getDouble(arkJs.getObjectProperty(eventObject, "containerHeight"))},
        .zoomScale = 1};
}

ScrollEventType getScrollEventType(ArkJS &arkJs, napi_value eventObject) {
    auto eventType = arkJs.getString(arkJs.getObjectProperty(eventObject, "type"));
    if (eventType == "beginDrag") {
        return ScrollEventType::BEGIN_DRAG;
    } else if (eventType == "endDrag") {
        return ScrollEventType::END_DRAG;
    } else if (eventType == "beginMomentum") {
        return ScrollEventType::BEGIN_MOMENTUM;
    } else if (eventType == "endMomentum") {
        return ScrollEventType::END_MOMENTUM;
    } else if (eventType == "scroll") {
        return ScrollEventType::SCROLLING;
    } else {
        throw std::runtime_error("Unknown scroll event type");
    }
}

class ScrollEventEmitRequestHandler : public EventEmitRequestHandler {
    void handleEvent(EventEmitRequestHandler::Context ctx) override {
        ArkJS arkJs(ctx.env);
        auto eventEmitter = ctx.eventEmitterRegistry->getEventEmitter<facebook::react::ScrollViewEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }
        auto event = convertScrollEvent(arkJs, ctx.payload);
        switch (getScrollEventType(arkJs, ctx.payload)) {
        case ScrollEventType::BEGIN_DRAG:
            eventEmitter->onScrollBeginDrag(event);
            break;
        case ScrollEventType::END_DRAG:
            eventEmitter->onScrollEndDrag(event);
            break;
        case ScrollEventType::BEGIN_MOMENTUM:
            eventEmitter->onMomentumScrollBegin(event);
            break;
        case ScrollEventType::END_MOMENTUM:
            eventEmitter->onMomentumScrollEnd(event);
            break;
        case ScrollEventType::SCROLLING:
            eventEmitter->onScroll(event);
            break;
        default:
            break;
        }
    }
};

} // namespace rnoh