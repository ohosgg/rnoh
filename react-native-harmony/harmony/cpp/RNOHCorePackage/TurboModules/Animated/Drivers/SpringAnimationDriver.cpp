#include "SpringAnimationDriver.h"

namespace rnoh {

using namespace facebook;

SpringAnimationDriver::SpringAnimationDriver(facebook::react::Tag animationId, facebook::react::Tag animatedNode, AnimatedNodesManager &nodesManager, folly::dynamic const &config, AnimationEndCallback &&endCallback)
    : AnimationDriver(animationId, animatedNode, nodesManager, std::move(endCallback)) {
        m_velocity = config["initialVelocity"].getDouble();
        resetConfig(config);
}

void SpringAnimationDriver::resetConfig(folly::dynamic const &config) {
    m_stiffness = config["stiffness"].getDouble();
    m_damping = config["damping"].getDouble();
    m_mass = config["mass"].getDouble();
    // we use the current velocity of the spring
    // to make animations fluid when setting new configs
    m_initialVelocity = m_velocity;
    m_overshootClamping = config["overshootClamping"].getBool();
    m_restSpeedThreshold = config["restSpeedThreshold"].getDouble();
    m_restDisplacementThreshold = config["restDisplacementThreshold"].getDouble();
    m_toValue = config["toValue"].getDouble();
    m_iterations = config.count("iterations") ? config["iterations"].getDouble() : 1;
    m_currentLoop = 0;
    m_timeAccumulator = 0;
    m_springStarted = false;
    m_hasFinished = m_iterations == 0;
}

void SpringAnimationDriver::runAnimationStep(uint64_t frameTimeNanos) {
    int64_t frameTimeMillis = frameTimeNanos / 1e6;
    auto &animatedValue = m_nodesManager.getValueNodeByTag(m_animatedNodeTag);
    if (!m_springStarted) {
        if (m_currentLoop == 0) {
            m_originalValue = animatedValue.m_value;
            m_currentLoop = 1;
        }
        m_fromValue = m_position = animatedValue.m_value;
        m_lastTime = frameTimeMillis;
        m_timeAccumulator = 0;
        m_springStarted = true;
    }
    advance((frameTimeMillis - m_lastTime) / 1000.0);
    m_lastTime = frameTimeMillis;
    animatedValue.setValue(m_position);
    if (isAtRest()) {
        if (m_iterations == -1 || m_currentLoop < m_iterations) {
            // reset animation for the next loop
            m_springStarted = false;
            animatedValue.setValue(m_originalValue);
            m_currentLoop++;
        } else {
            m_hasFinished = true;
        }
    }
}

bool SpringAnimationDriver::isAtRest() const {
    return std::abs(m_velocity) <= m_restSpeedThreshold 
        && (std::abs(m_position - m_toValue) <= m_restDisplacementThreshold || m_stiffness == 0);
}

bool SpringAnimationDriver::isOvershooting() const {
    return m_stiffness > 0 
        && ((m_fromValue < m_toValue && m_position > m_toValue) 
            || (m_fromValue > m_toValue && m_position < m_toValue));
}

void SpringAnimationDriver::advance(double deltaTime) {
    if (isAtRest()) {
        return;
    }

    // clamp the amount of realTime to simulate to avoid stuttering in the UI. We should be able
    // to catch up in a subsequent advance if necessary.
    double adjustedDeltaTime = deltaTime;
    if (deltaTime > MAX_DELTA_TIME_SEC) {
      adjustedDeltaTime = MAX_DELTA_TIME_SEC;
    }

    m_timeAccumulator += adjustedDeltaTime;

    double c = m_damping;
    double m = m_mass;
    double k = m_stiffness;
    double v0 = -m_initialVelocity;
    double x0 = m_toValue - m_fromValue;

    double zeta = c / (2 * std::sqrt(k * m)); // damping coefficient
    double omega0 = std::sqrt(k / m); // undamped angular frequency of the oscillator (rad/ms)
    double omega1 = omega0 * std::sqrt(1.0 - zeta * zeta);

    double velocity;
    double position;
    double t = m_timeAccumulator;
    if (zeta < 1) {
      // Under damped
      double envelope = std::exp(-zeta * omega0 * t);
      position =
          m_toValue
              - envelope
                  * ((v0 + zeta * omega0 * x0) / omega1 * std::sin(omega1 * t)
                      + x0 * std::cos(omega1 * t));
      // This looks crazy -- it's actually just the derivative of the
      // oscillation function
      velocity =
          zeta
                  * omega0
                  * envelope
                  * (std::sin(omega1 * t) * (v0 + zeta * omega0 * x0) / omega1
                      + x0 * std::cos(omega1 * t))
              - envelope
                  * (std::cos(omega1 * t) * (v0 + zeta * omega0 * x0)
                      - omega1 * x0 * std::sin(omega1 * t));
    } else {
      // Critically damped spring
      double envelope = std::exp(-omega0 * t);
      position = m_toValue - envelope * (x0 + (v0 + omega0 * x0) * t);
      velocity = envelope * (v0 * (t * omega0 - 1) + t * x0 * (omega0 * omega0));
    }

    m_position = position;
    m_velocity = velocity;

    // End the spring immediately if it is overshooting and overshoot clamping is enabled.
    // Also make sure that if the spring was considered within a resting threshold that it's now
    // snapped to its end value.
    if (isAtRest() || (m_overshootClamping && isOvershooting())) {
      // Don't call setCurrentValue because that forces a call to onSpringUpdate
      if (m_stiffness > 0) {
        m_fromValue = m_toValue;
        m_position = m_toValue;
      } else {
        m_toValue = m_position;
        m_fromValue = m_toValue;
      }
      m_velocity = 0;
    }
}

} // namespace rnoh