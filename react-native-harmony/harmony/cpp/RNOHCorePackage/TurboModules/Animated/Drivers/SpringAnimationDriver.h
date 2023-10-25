#pragma once

#include "AnimationDriver.h"

#include <folly/dynamic.h>

namespace rnoh {

class SpringAnimationDriver : public AnimationDriver {
public:
    SpringAnimationDriver(
        facebook::react::Tag animationId, 
        facebook::react::Tag animatedNode,
        AnimatedNodesManager &nodesManager,
        folly::dynamic const &config,
        AnimationEndCallback &&endCallback);

    void resetConfig(folly::dynamic const &config) override;

    void runAnimationStep(uint64_t frameTimeNanos) override;
private:
    static constexpr double MAX_DELTA_TIME_SEC = 0.064;
    static constexpr double SOLVER_TIMESTEP_SEC = 0.001;

    bool isAtRest() const;
    bool isOvershooting() const;
    void advance(double deltaTime);

    int64_t m_startTimeNanos;
    bool m_springStarted;

    double m_lastTime;

    // spring configuration
    double m_stiffness;
    double m_damping;
    double m_mass;
    double m_initialVelocity;
    bool m_overshootClamping;

    // spring state
    double m_position;
    double m_velocity;

    // threshold to determine if the spring is at rest
    double m_restSpeedThreshold;
    double m_restDisplacementThreshold;
    double m_timeAccumulator;

    double m_toValue;
    double m_fromValue;

    // looping control
    int64_t m_iterations;
    uint64_t m_currentLoop;
    double m_originalValue;
    bool m_hasFinished;
};

} // namespace rnoh