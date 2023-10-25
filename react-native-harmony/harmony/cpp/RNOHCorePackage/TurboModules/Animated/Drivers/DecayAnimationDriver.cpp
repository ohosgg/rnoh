#include "DecayAnimationDriver.h"

namespace rnoh {

DecayAnimationDriver::DecayAnimationDriver(facebook::react::Tag animationId, facebook::react::Tag animatedNode, AnimatedNodesManager &nodesManager, folly::dynamic const &config, AnimationEndCallback &&endCallback)
    : AnimationDriver(animationId, animatedNode, nodesManager, std::move(endCallback)) {
        m_velocity = config["velocity"].getDouble(); // initial velocity
        resetConfig(config);
    }

    void DecayAnimationDriver::resetConfig(folly::dynamic const &config) {
        m_deceleration = config["deceleration"].getDouble();
        m_iterations = config.count("iterations") ? config["iterations"].getDouble() : 1;
        m_currentLoop = 1;
        m_hasStarted = false;
        m_hasFinished = m_iterations == 0;
        m_fromValue = 0;
        m_lastValue = 0;
    }

    void DecayAnimationDriver::runAnimationStep(uint64_t frameTimeNanos) {
        int64_t frameTimeMillis = frameTimeNanos / 1e6;
        auto &animatedValue = m_nodesManager.getValueNodeByTag(m_animatedNodeTag);
        if (!m_hasStarted) {
            // since this is the first frame of the animation,
            // we set the start time to the previous frame.
            // Since we don't know the actual framerate, we use 16ms as the frame time.
            m_startTimeMillis = frameTimeMillis - 16;
            if (m_currentLoop == 1) { // first iteration, assign fromValue from the animatedValue
                m_fromValue = animatedValue.m_value;
            } else { // otherwise, reset the animatedValue based on fromValue
                animatedValue.setValue(m_fromValue);
            }
            m_lastValue = m_fromValue;
            m_hasStarted = true;
        }

        double value = m_fromValue 
            + (m_velocity / (1 - m_deceleration)) 
                * (1 - std::exp(-(1 - m_deceleration) * (frameTimeMillis - m_startTimeMillis)));

        if (std::abs(m_lastValue - value) < 0.1) {
            if (m_iterations == -1 || m_currentLoop < m_iterations) {
                // reset animation for the next loop
                m_hasStarted = false;
                m_currentLoop++;
            } else {
                m_hasFinished = true;
                return;
            }
        }

        m_lastValue = value;
        animatedValue.setValue(value);
    }
} // namespace rnoh
