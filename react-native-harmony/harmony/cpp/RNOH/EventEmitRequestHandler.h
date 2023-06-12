#pragma once
#include <string>
#include <unordered_map>
#include <napi/native_api.h>
#include "RNOH/EventEmitterRegistry.h"
namespace rnoh {

class EventEmitRequestHandler {
  public:
    struct Context {
        std::shared_ptr<EventEmitterRegistry> eventEmitterRegistry;
        napi_env env;
        facebook::react::Tag tag;
        napi_value payload;
    };

    virtual void handleEvent(Context ctx) = 0;
};

using EventEmitRequestHandlerByString = std::unordered_map<std::string, std::shared_ptr<EventEmitRequestHandler>>;

} // namespace rnoh