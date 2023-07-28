#pragma once

#include <unordered_map>

#include <react/renderer/mounting/ShadowView.h>

namespace rnoh {

class ShadowViewRegistry {
  public:
    using Shared = std::shared_ptr<ShadowViewRegistry>;

    void setShadowView(facebook::react::Tag, facebook::react::ShadowView const &);
    void clearShadowView(facebook::react::Tag);

    template <typename TEventEmitter>
    std::shared_ptr<const TEventEmitter> getEventEmitter(facebook::react::Tag tag) {
        auto it = m_shadowViewEntryByTag.find(tag);
        if (it != m_shadowViewEntryByTag.end()) {
            return std::dynamic_pointer_cast<const TEventEmitter>(it->second.eventEmitter.lock());
        }
        return nullptr;
    }

    template <typename TState>
    std::shared_ptr<TState const> getFabricState(facebook::react::Tag tag) {
        auto it = m_shadowViewEntryByTag.find(tag);
        if (it != m_shadowViewEntryByTag.end()) {
            return std::dynamic_pointer_cast<const TState>(it->second.state.lock());
        }
        return nullptr;
    }

  private:
    using WeakEventEmitter = std::weak_ptr<facebook::react::EventEmitter const>;
    using WeakState = std::weak_ptr<facebook::react::State const>;

    struct ShadowViewEntry {
        WeakEventEmitter eventEmitter;
        WeakState state;
    };

    std::unordered_map<facebook::react::Tag, ShadowViewEntry> m_shadowViewEntryByTag;
};

} // namespace rnoh
