#pragma once

#include <folly/dynamic.h>

#include "RNOHCorePackage/TurboModules/Animated/AnimatedNodesManager.h"
#include "RNOHCorePackage/TurboModules/Animated/Nodes/ValueAnimatedNode.h"

namespace rnoh {

class AnimatedNodesManager;

class AnimationDriver {
public:
    using AnimationEndCallback = std::function<void(bool)>;

    AnimationDriver(facebook::react::Tag animationId, facebook::react::Tag animatedNode, AnimatedNodesManager &nodesManager, AnimationEndCallback &&endCallback);
    virtual ~AnimationDriver() = default;

    virtual void runAnimationStep(uint64_t frameTimeNanos) = 0;
    virtual void resetConfig(folly::dynamic const &config);

    facebook::react::Tag getId() const;
    ValueAnimatedNode &getAnimatedValue();
    facebook::react::Tag getAnimatedValueTag() const;
    bool hasFinished() const;

    AnimationEndCallback endCallback_;

protected:
    facebook::react::Tag m_animationId;
    facebook::react::Tag m_animatedNodeTag;
    AnimatedNodesManager &m_nodesManager;
    bool m_hasFinished = false;
};

} // namespace rnoh
