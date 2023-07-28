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
    SCROLLING = 4,
    UNSUPPORTED = 5
};

facebook::react::ScrollViewMetrics convertScrollEvent(ArkJS &arkJs, napi_value eventObject) {
    auto arkContentSize = arkJs.getObjectProperty(eventObject, "contentSize");
    facebook::react::Size contentSize = {
        (float)arkJs.getDouble(arkJs.getObjectProperty(arkContentSize, "width")),
        (float)arkJs.getDouble(arkJs.getObjectProperty(arkContentSize, "height"))};

    auto arkContentOffset = arkJs.getObjectProperty(eventObject, "contentOffset");
    facebook::react::Point contentOffset = {
        (float)arkJs.getDouble(arkJs.getObjectProperty(arkContentOffset, "x")),
        (float)arkJs.getDouble(arkJs.getObjectProperty(arkContentOffset, "y"))};

    auto arkContainerSize = arkJs.getObjectProperty(eventObject, "containerSize");
    facebook::react::Size containerSize = {
        (float)arkJs.getDouble(arkJs.getObjectProperty(arkContainerSize, "width")),
        (float)arkJs.getDouble(arkJs.getObjectProperty(arkContainerSize, "height"))};

    float zoomScale = (float)arkJs.getDouble(arkJs.getObjectProperty(eventObject, "zoomScale"));

    return {
        contentSize,
        contentOffset,
        {},
        containerSize,
        zoomScale};
}

ScrollEventType getScrollEventType(std::string const &eventType) {
    if (eventType == "onScrollBeginDrag") {
        return ScrollEventType::BEGIN_DRAG;
    } else if (eventType == "onScrollEndDrag") {
        return ScrollEventType::END_DRAG;
    } else if (eventType == "onMomentumScrollBegin") {
        return ScrollEventType::BEGIN_MOMENTUM;
    } else if (eventType == "onMomentumScrollEnd") {
        return ScrollEventType::END_MOMENTUM;
    } else if (eventType == "onScroll") {
        return ScrollEventType::SCROLLING;
    } else {
        return ScrollEventType::UNSUPPORTED;
    }
}

class ScrollEventEmitRequestHandler : public EventEmitRequestHandler {
    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        auto eventType = getScrollEventType(ctx.eventName);
        if (eventType == ScrollEventType::UNSUPPORTED) {
            return;
        }

        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<facebook::react::ScrollViewEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }

        ArkJS arkJs(ctx.env);
        auto event = convertScrollEvent(arkJs, ctx.payload);

        switch (eventType) {
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