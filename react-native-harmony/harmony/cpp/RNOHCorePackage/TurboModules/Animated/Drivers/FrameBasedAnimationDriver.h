#pragma once

#include "AnimationDriver.h"

#include <folly/dynamic.h>

namespace rnoh {

class FrameBasedAnimationDriver : public AnimationDriver {
public:
    FrameBasedAnimationDriver(
        facebook::react::Tag animationId, 
        facebook::react::Tag animatedNode,
        AnimatedNodesManager &nodesManager,
        folly::dynamic const &config,
        AnimationEndCallback &&endCallback);

    void resetConfig(folly::dynamic const &config) override;

    void runAnimationStep(uint64_t frameTimeNanos) override;
private:
    int64_t m_startTimeNanos;
    std::vector<double> m_frames;
    double m_toValue;
    double m_fromValue;
    int64_t m_iterations;
    uint64_t m_currentLoop;
};

} // namespace rnoh