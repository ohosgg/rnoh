#pragma once
#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"
#include <react/renderer/components/image/ImageEventEmitter.h>

namespace rnoh {

class ImageEventEmitRequestHandler : public EventEmitRequestHandler {

    struct ImageLoadEventSourceObject {
        float width;
        float height;
        std::string uri;
    };

    ImageLoadEventSourceObject getImageLoadEventSourceObject(ArkJS &arkJs, napi_value eventObject) {
        auto width = (float)(arkJs.getDouble(arkJs.getObjectProperty(eventObject, "width")));
        auto height = (float)(arkJs.getDouble(arkJs.getObjectProperty(eventObject, "height")));
        auto uri = arkJs.getString(arkJs.getObjectProperty(eventObject, "uri"));
        return {width, height, uri};
    }

    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        if (ctx.eventName != "loadStart" && ctx.eventName != "load") {
            return;
        }

        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<facebook::react::ImageEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }

        ArkJS arkJs(ctx.env);
        if (ctx.eventName == "loadStart") {
            eventEmitter->onLoadStart();
        } else if (ctx.eventName == "load") {
            auto imageLoadEventSourceObject = getImageLoadEventSourceObject(arkJs, ctx.payload);
            eventEmitter->dispatchEvent("load", [=](facebook::jsi::Runtime &runtime) {
                auto payload = facebook::jsi::Object(runtime);
                auto source = facebook::jsi::Object(runtime);
                source.setProperty(runtime, "width", imageLoadEventSourceObject.width);
                source.setProperty(runtime, "height", imageLoadEventSourceObject.height);
                source.setProperty(runtime, "uri", imageLoadEventSourceObject.uri.c_str());
                payload.setProperty(runtime, "source", source);
                return payload;
            });
        }
    }
};

} // namespace rnoh