#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"
#include <react/renderer/components/scrollview/ScrollViewEventEmitter.h>

namespace rnoh {

enum ScrollEventType {
    BEGIN = 0,
    END = 1,
    SCROLLING = 2,
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
    if (eventType == "begin") {
        return ScrollEventType::BEGIN;
    } else if (eventType == "end") {
        return ScrollEventType::END;
    } else if (eventType == "scroll") {
        return ScrollEventType::SCROLLING;
    } else {
        throw std::runtime_error("Unknown scroll event type");
    }
}

class ScrollEventEmitRequestHandler : public EventEmitRequestHandler {
    void handleEvent(EventEmitRequestHandler::Context ctx) override {
        ArkJS arkJs(ctx.env);
        auto eventEmitter = ctx.eventEmitterRegistry->getEventEmitter<react::ScrollViewEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }
        auto event = convertScrollEvent(arkJs, ctx.payload);
        switch (getScrollEventType(arkJs, ctx.payload)) {
        case ScrollEventType::BEGIN:
            eventEmitter->onScrollBeginDrag(event);
            break;
        case ScrollEventType::END:
            eventEmitter->onScrollEndDrag(event);
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