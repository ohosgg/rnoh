#pragma once
#include <unordered_map>
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
    void handleEvent(TouchEventEmitRequestHandler::Context ctx) override;

  private:
    facebook::react::Touch convertTouchObject(ArkJS &arkJs, napi_value touchObject);

    facebook::react::Touches convertTouches(
        ArkJS &arkJs, 
        facebook::react::Tag tag, 
        facebook::react::Float timestamp, 
        napi_value touchArray
    );

    std::unordered_map<facebook::react::Tag, facebook::react::Tag> m_tagsForTouchIds;
};

} // namespace rnoh