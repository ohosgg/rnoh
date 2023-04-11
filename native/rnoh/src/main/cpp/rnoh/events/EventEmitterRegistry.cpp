#include "RNOH/events/EventEmitterRegistry.h"

namespace rnoh {

void EventEmitterRegistry::setEventEmitter(facebook::react::Tag tag, facebook::react::EventEmitter::Shared emitter) {
    this->eventEmitterByTag.insert_or_assign(tag, std::move(emitter));
}

void EventEmitterRegistry::clearEventEmitter(facebook::react::Tag tag) {
    this->eventEmitterByTag.erase(tag);
}

} // namespace rnoh
