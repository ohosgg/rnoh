#include "AnimationDriver.h"

using namespace facebook;

namespace rnoh {

AnimationDriver::AnimationDriver(react::Tag animationId, react::Tag animatedNode, AnimatedNodesManager &nodesManager, AnimationEndCallback &&endCallback)
    : m_animationId(animationId),
      m_animatedNodeTag(animatedNode),
      m_nodesManager(nodesManager),
      endCallback_(std::move(endCallback)) {}

void AnimationDriver::resetConfig(folly::dynamic const &config) {
    throw new std::runtime_error("AnimationDriver::resetConfig() is not implemented");
}

facebook::react::Tag AnimationDriver::getId() const {
    return m_animationId;
}

ValueAnimatedNode &AnimationDriver::getAnimatedValue() {
    return m_nodesManager.getValueNodeByTag(m_animatedNodeTag);
}

facebook::react::Tag AnimationDriver::getAnimatedValueTag() const {
    return m_animatedNodeTag;
}

bool AnimationDriver::hasFinished() const {
    return m_hasFinished;
}

} // namespace rnoh
