#pragma once

#include "RNOHCorePackage/TurboModules/Animated/AnimatedNodesManager.h"
#include "ValueAnimatedNode.h"

namespace rnoh {

template<typename OperatorT>
class AssociativeOperationNode : public ValueAnimatedNode {
  public:
    AssociativeOperationNode(folly::dynamic const &config, AnimatedNodesManager &nodesManager)
        : m_nodesManager(nodesManager) {
        for (auto const &entry : config["input"]) {
            m_inputNodeTags.push_back(entry.asDouble());
        }
    }

    void update() override {
        double value = 0;
        for (auto nodeTagIt = m_inputNodeTags.begin(); nodeTagIt != m_inputNodeTags.end(); ++nodeTagIt) {
            auto &node = m_nodesManager.getValueNodeByTag(*nodeTagIt);
            if (nodeTagIt == m_inputNodeTags.begin()) {
                value = node.getValue();
            } else {
                value = operation(value, node.getValue());
            }
        }
        m_value = value;
    }

  private:
    OperatorT operation;
    std::vector<facebook::react::Tag> m_inputNodeTags;
    AnimatedNodesManager &m_nodesManager;
};

struct SafeDivides {
    double operator()(double a, double b) {
        if (b == 0) {
            throw new std::runtime_error("Division by zero in Animated.divide node");
        }
        return a / b;
    }
};

using AdditionAnimatedNode = AssociativeOperationNode<std::plus<double>>;
using SubtractionAnimatedNode = AssociativeOperationNode<std::minus<double>>;
using MultiplicationAnimatedNode = AssociativeOperationNode<std::multiplies<double>>;
using DivisionAnimatedNode = AssociativeOperationNode<SafeDivides>;

} // namespace rnoh