#include "RNOH/ShadowViewRegistry.h"

namespace rnoh {

void ShadowViewRegistry::setShadowView(
    facebook::react::Tag tag,
    facebook::react::ShadowView const &shadowView) {
    m_shadowViewEntryByTag.insert_or_assign(
        tag,
        ShadowViewEntry{shadowView.eventEmitter, shadowView.state});
}

void ShadowViewRegistry::clearShadowView(facebook::react::Tag tag) {
    m_shadowViewEntryByTag.erase(tag);
}

} // namespace rnoh
