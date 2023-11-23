#pragma once

#include "RNOHCorePackage/TurboModules/Animated/AnimatedNodesManager.h"
#include "ValueAnimatedNode.h"

namespace rnoh {

class ModulusAnimatedNode : public ValueAnimatedNode {
  public:
    ModulusAnimatedNode(folly::dynamic const &config, AnimatedNodesManager &nodesManager)
        : m_nodesManager(nodesManager) {
        m_inputNodeTag = static_cast<size_t>(config["input"].getDouble());
        m_modulusValue = config["modulus"].getDouble();
    }

    void update() override {
        auto &node = m_nodesManager.getValueNodeByTag(m_inputNodeTag);
        auto inputValue = node.getValue();
        m_value = fmod(fmod(inputValue, m_modulusValue) + m_modulusValue, m_modulusValue);
    }

  private:
    facebook::react::Tag m_inputNodeTag;
    double m_modulusValue;
    AnimatedNodesManager &m_nodesManager;
};

} // namespace rnoh