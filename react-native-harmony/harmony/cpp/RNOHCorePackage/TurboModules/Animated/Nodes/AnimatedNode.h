#pragma once

#include <vector>
#include "react/renderer/core/ReactPrimitives.h"

namespace rnoh {

class AnimatedNode {
public:
    AnimatedNode(AnimatedNode const &) = delete;
    virtual ~AnimatedNode() = default;

    virtual void update();
    virtual void onAttachedToNode(facebook::react::Tag tag);
    virtual void onDetachedFromNode(facebook::react::Tag tag);

    void addChild(AnimatedNode &child);
    void removeChild(AnimatedNode &child);

    std::vector<facebook::react::Tag> const &getChildrenTags() const;

    facebook::react::Tag tag_ = -1;
protected:
    std::vector<facebook::react::Tag> m_childrenTags;
    AnimatedNode() = default;
};

}