#pragma once
#include <napi/native_api.h>
#include <react/renderer/core/EventEmitter.h>

#include "ArkJS.h"
#include "mounting/events/EventEmitterRegistry.h"

namespace rnoh {

enum ReactEventKind {
    TOUCH = 0
};

class EventEmitterHelper {
  public:
    EventEmitterHelper(ArkJS arkJs, EventEmitterRegistry::Shared eventEmitterRegistry)
        : arkJs(std::move(arkJs)), eventEmitterRegistry(std::move(eventEmitterRegistry)) {}

    void emitEvent(facebook::react::Tag tag, ReactEventKind eventKind, napi_value eventObject);

  private:
    ArkJS arkJs;
    EventEmitterRegistry::Shared eventEmitterRegistry;
};

} // namespace rnoh
