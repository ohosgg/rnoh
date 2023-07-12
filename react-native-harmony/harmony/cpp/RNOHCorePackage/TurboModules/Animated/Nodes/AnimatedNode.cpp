#include "AnimatedNode.h"

using namespace facebook;

namespace rnoh {

void AnimatedNode::update() {}

void AnimatedNode::onAttachedToNode(facebook::react::Tag tag) {}

void AnimatedNode::onDetachedFromNode(facebook::react::Tag tag) {}

void AnimatedNode::addChild(AnimatedNode &child) {
    m_childrenTags.push_back(child.tag_);
    child.onAttachedToNode(tag_);
}

void AnimatedNode::removeChild(AnimatedNode &child) {
    child.onDetachedFromNode(tag_);
    m_childrenTags.erase(std::remove(m_childrenTags.begin(), m_childrenTags.end(), child.tag_), m_childrenTags.end());
}

std::vector<facebook::react::Tag> const &AnimatedNode::getChildrenTags() const {
    return m_childrenTags;
}
}