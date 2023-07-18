#pragma once

#include "AnimatedNode.h"
#include "StyleAnimatedNode.h"
#include "RNOHCorePackage/TurboModules/Animated/AnimatedNodesManager.h"

#include <glog/logging.h>
#include <folly/dynamic.h>
#include <unordered_map>

namespace rnoh {

class PropsAnimatedNode : public AnimatedNode {
public:
    PropsAnimatedNode(folly::dynamic const &config, AnimatedNodesManager &nodesManager)
        : m_nodesManager(nodesManager) 
    {
        for (auto const &entry : config["props"].items()) {
            m_tagByPropName[entry.first.asString()] = entry.second.asDouble();
        }
    }

    void connectToView(facebook::react::Tag viewTag) {
        m_viewTag = viewTag;
    }

    void disconnectFromView(facebook::react::Tag viewTag) {
        if (m_viewTag != viewTag) {
            throw new std::runtime_error("Attempting to disconnect view that has not been connected with the given animated node");
        }
        m_viewTag = std::nullopt;
    }

    void updateView() {
        if (m_viewTag == std::nullopt) {
            LOG(WARNING) << "PropsAnimatedNode::updateView() called on unconnected node";
            return;
        }
        folly::dynamic props = folly::dynamic::object;
        for (auto &[key, nodeTag] : m_tagByPropName) {
            auto node = &m_nodesManager.getNodeByTag(nodeTag);
            if (auto styleNode = dynamic_cast<StyleAnimatedNode*>(node); styleNode != nullptr) {
                props.update(styleNode->getStyle());
            } else if (auto valueNode = dynamic_cast<ValueAnimatedNode*>(node); valueNode != nullptr) {
                props[key] = valueNode->getValue();
            } else {
                throw new std::runtime_error("Unsupported node type");
            }
        }

        m_nodesManager.m_setNativePropsFn(*m_viewTag, props);
    }

private:
    std::optional<facebook::react::Tag> m_viewTag;
    std::unordered_map<std::string, facebook::react::Tag> m_tagByPropName;
    AnimatedNodesManager &m_nodesManager;
};

}