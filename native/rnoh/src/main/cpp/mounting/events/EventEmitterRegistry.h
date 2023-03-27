#pragma once

#include <unordered_map>

#include <react/renderer/core/EventEmitter.h>

namespace rnoh {

class EventEmitterRegistry {
  public:
    using Shared = std::shared_ptr<EventEmitterRegistry>;

    void setEventEmitter(facebook::react::Tag, facebook::react::EventEmitter::Shared);
    void clearEventEmitter(facebook::react::Tag);

    template <typename TEventEmitter>
    std::shared_ptr<const TEventEmitter> getEventEmitter(facebook::react::Tag tag) {
        auto it = eventEmitterByTag.find(tag);
        if (it != eventEmitterByTag.end()) {
            return std::dynamic_pointer_cast<const TEventEmitter>(it->second);
        }
        return nullptr;
    }

  private:
    std::unordered_map<facebook::react::Tag, facebook::react::EventEmitter::Shared> eventEmitterByTag;
};

} // namespace rnoh
