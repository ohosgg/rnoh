#include "TrackingAnimatedNode.h"

namespace rnoh {

TrackingAnimatedNode::TrackingAnimatedNode(folly::dynamic const &config, AnimatedNodesManager &nodesManager) 
    : m_nodesManager(nodesManager) {
    m_animationId = static_cast<size_t>(config["animationId"].getDouble());
    m_valueNodeTag = static_cast<size_t>(config["value"].getDouble());
    m_toValueNodeTag = static_cast<size_t>(config["toValue"].getDouble());
    m_animationConfig = config["animationConfig"];
}

void TrackingAnimatedNode::update() {
    auto &toValueNode = m_nodesManager.getValueNodeByTag(m_toValueNodeTag);
    m_animationConfig["toValue"] = toValueNode.getValue();
    m_nodesManager.startAnimatingNode(m_animationId, m_valueNodeTag, m_animationConfig, [](auto _val){});
}

void TrackingAnimatedNode::onDetachedFromNode(facebook::react::Tag tag) {
    m_nodesManager.stopAnimation(m_animationId);
    AnimatedNode::onDetachedFromNode(tag);
}

} // namespace rnoh