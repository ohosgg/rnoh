#include "AnimatedNodesManager.h"

#include <glog/logging.h>
#include <queue>
#include <functional>

#include "Nodes/StyleAnimatedNode.h"
#include "Nodes/ValueAnimatedNode.h"
#include "Nodes/PropsAnimatedNode.h"
#include "Nodes/TransformAnimatedNode.h"
#include "Nodes/InterpolationAnimatedNode.h"
#include "Nodes/AssociativeOperationNode.h"

#include "Drivers/EventAnimationDriver.h"
#include "Drivers/FrameBasedAnimationDriver.h"
#include "Drivers/SpringAnimationDriver.h"
#include "Drivers/DecayAnimationDriver.h"

using namespace facebook;

namespace rnoh {

AnimatedNodesManager::AnimatedNodesManager(std::function<void()> &&scheduleUpdateFn, std::function<void(react::Tag, folly::dynamic)> &&setNativePropsFn)
    : m_scheduleUpdateFn(std::move(scheduleUpdateFn)),
      m_setNativePropsFn(std::move(setNativePropsFn)) {}

void AnimatedNodesManager::createNode(facebook::react::Tag tag, folly::dynamic const &config) {
    LOG(INFO) << "AnimatedNodesManager::createNode(" << tag <<", " << config << ")";
    auto type = config["type"].asString();
    std::unique_ptr<AnimatedNode> node;

    if (type == "props") {
        node = std::make_unique<PropsAnimatedNode>(config, *this);
    } else if (type == "style") {
        node = std::make_unique<StyleAnimatedNode>(config, *this);
    } else if (type == "value") {
        node = std::make_unique<ValueAnimatedNode>(config);
    } else if (type == "transform") {
        node = std::make_unique<TransformAnimatedNode>(config, *this);
    } else if (type == "interpolation") {
        node = std::make_unique<InterpolationAnimatedNode>(config, *this);
    } else if (type == "addition") {
        node = std::make_unique<AdditionAnimatedNode>(config, *this);
    } else if (type == "subtraction") {
        node = std::make_unique<SubtractionAnimatedNode>(config, *this);
    } else if (type == "multiplication") {
        node = std::make_unique<MultiplicationAnimatedNode>(config, *this);
    } else if (type == "division") {
        node = std::make_unique<DivisionAnimatedNode>(config, *this);
    } else {
        throw std::runtime_error("Unsupported animated node type: " + type);
    }

    node->tag_ = tag;
    m_nodeByTag.insert({tag, std::move(node)});
    m_nodeTagsToUpdate.insert(tag);
}

void AnimatedNodesManager::dropNode(facebook::react::Tag tag) {
    m_nodeTagsToUpdate.erase(tag);
    m_nodeByTag.erase(tag);
}

void AnimatedNodesManager::connectNodes(facebook::react::Tag parentTag, facebook::react::Tag childTag) {
    auto &parent = getNodeByTag(parentTag);
    auto &child = getNodeByTag(childTag);

    parent.addChild(child);
    m_nodeTagsToUpdate.insert(childTag);
}

void AnimatedNodesManager::disconnectNodes(facebook::react::Tag parentTag, facebook::react::Tag childTag) {
    auto &parent = getNodeByTag(parentTag);
    auto &child = getNodeByTag(childTag);

    parent.removeChild(child);
    m_nodeTagsToUpdate.insert(childTag);
}

void AnimatedNodesManager::connectNodeToView(facebook::react::Tag nodeTag, facebook::react::Tag viewTag) {
    auto &node = dynamic_cast<PropsAnimatedNode &>(getNodeByTag(nodeTag));
    node.connectToView(viewTag);
    m_nodeTagsToUpdate.insert(nodeTag);
}

void AnimatedNodesManager::disconnectNodeFromView(facebook::react::Tag nodeTag, facebook::react::Tag viewTag) {
    auto &node = dynamic_cast<PropsAnimatedNode &>(getNodeByTag(nodeTag));
    node.disconnectFromView(viewTag);
}

void AnimatedNodesManager::addAnimatedEventToView(react::Tag viewTag, const std::string &eventName, const folly::dynamic &eventMapping) {
    LOG(INFO) << "addAnimatedEventToView " << viewTag << " " << eventName << " " << eventMapping;
    auto nodeTag = eventMapping["animatedValueTag"].asInt();
    auto dynamicNativeEventPath = eventMapping["nativeEventPath"];
    std::vector<std::string> nativeEventPath;
    for (auto &key : dynamicNativeEventPath) {
        nativeEventPath.push_back(key.asString());
    }
    m_eventDrivers.push_back(std::make_unique<EventAnimationDriver>(eventName, viewTag, std::move(nativeEventPath), nodeTag, *this));
}

void AnimatedNodesManager::removeAnimatedEventFromView(facebook::react::Tag viewTag, std::string const &eventName, facebook::react::Tag animatedValueTag) {
    LOG(INFO) << "removeAnimatedEventFromView " << viewTag << " " << eventName << " " << animatedValueTag;
    m_eventDrivers.erase(std::remove_if(m_eventDrivers.begin(), m_eventDrivers.end(), [&](auto &driver) {
        return driver->getViewTag() == viewTag && driver->getEventName() == eventName && driver->getNodeTag() == animatedValueTag;
    }));
}

void AnimatedNodesManager::startListeningToAnimatedNodeValue(facebook::react::Tag tag, ValueAnimatedNode::AnimatedNodeValueListener &&listener) {
    auto &node = getValueNodeByTag(tag);
    node.setValueListener(std::move(listener));
}

void AnimatedNodesManager::stopListeningToAnimatedNodeValue(facebook::react::Tag tag) {
    auto &node = getValueNodeByTag(tag);
    node.removeValueListener();
}

void AnimatedNodesManager::handleEvent(facebook::react::Tag targetTag, std::string const &eventName, folly::dynamic const &eventValue) {
    bool someDriverNeedsUpdate = false;
    for (auto &driver : m_eventDrivers) {
        if (driver->getViewTag() == targetTag && driver->getEventName() == eventName) {
            someDriverNeedsUpdate = true;
            driver->updateWithEvent(eventValue);
        }
    }

    if (someDriverNeedsUpdate && !m_isRunningAnimations) {
        maybeStartAnimations();
    }
}

void AnimatedNodesManager::setValue(facebook::react::Tag tag, double value) {
    auto &node = getValueNodeByTag(tag);
    stopAnimationsForNode(tag);
    m_nodeTagsToUpdate.insert(tag);
    node.setValue(value);
    maybeStartAnimations();
}

void AnimatedNodesManager::setOffset(facebook::react::Tag tag, double offset) {
    auto &node = getValueNodeByTag(tag);
    m_nodeTagsToUpdate.insert(tag);
    node.setOffset(offset);
    maybeStartAnimations();
}

void AnimatedNodesManager::flattenOffset(facebook::react::Tag tag) {
    auto &node = getValueNodeByTag(tag);
    node.flattenOffset();
}

void AnimatedNodesManager::extractOffset(facebook::react::Tag tag) {
    auto &node = getValueNodeByTag(tag);
    node.extractOffset();
}

double AnimatedNodesManager::getValue(facebook::react::Tag tag) {
    auto &node = getValueNodeByTag(tag);
    return node.getValue();
}

void AnimatedNodesManager::startAnimatingNode(facebook::react::Tag animationId, facebook::react::Tag nodeTag, folly::dynamic const &config, std::function<void(bool)> &&endCallback) {
    auto type = config["type"].asString();
    auto &node = getValueNodeByTag(nodeTag);

    if (auto it = m_animationById.find(animationId); it != m_animationById.end()) {
        it->second->resetConfig(config);
        return;
    }

    std::unique_ptr<AnimationDriver> driver;
    if (type == "frames") {
        driver = std::make_unique<FrameBasedAnimationDriver>(animationId, nodeTag, *this, config, std::move(endCallback));
    } else if (type == "spring") {
        driver = std::make_unique<SpringAnimationDriver>(animationId, nodeTag, *this, config, std::move(endCallback));
    } else if (type == "decay") {
        driver = std::make_unique<DecayAnimationDriver>(animationId, nodeTag, *this, config, std::move(endCallback));
    } else {
        throw std::runtime_error("Unsupported animation type: " + type);
    }

    m_animationById.insert({animationId, std::move(driver)});
    maybeStartAnimations();
}

void AnimatedNodesManager::stopAnimation(facebook::react::Tag animationId) {
    if (auto it = m_animationById.find(animationId); it != m_animationById.end()) {
        if (it->second->getId() == animationId) {
            it->second->endCallback_(false);
            m_animationById.erase(animationId);
        }
    }
}

void AnimatedNodesManager::runUpdates(uint64_t frameTimeNanos) {
    std::vector<facebook::react::Tag> finishedAnimations;

    for (auto &[animationId, driver] : m_animationById) {
        driver->runAnimationStep(frameTimeNanos);
        m_nodeTagsToUpdate.insert(driver->getAnimatedValueTag());
        if (driver->hasFinished()) {
            finishedAnimations.push_back(animationId);
        }
    }

    std::vector<facebook::react::Tag> updatedNodesList(m_nodeTagsToUpdate.begin(), m_nodeTagsToUpdate.end());
    m_nodeTagsToUpdate.clear();

    updateNodes(std::move(updatedNodesList));

    for (auto animationId : finishedAnimations) {
        m_animationById.at(animationId)->endCallback_(true);
        m_animationById.erase(animationId);
    }

    if (m_animationById.empty()) {
        m_isRunningAnimations = false;
    } else {
        m_isRunningAnimations = true;
        m_scheduleUpdateFn();
    }
}

void AnimatedNodesManager::setNeedsUpdate(facebook::react::Tag nodeTag) {
    m_nodeTagsToUpdate.insert(nodeTag);
}

void AnimatedNodesManager::updateNodes(std::vector<facebook::react::Tag> nodeTags) {
    uint64_t activeNodesCount = 0;
    uint64_t updatedNodesCount = 0;

    std::queue<react::Tag> nodeTagsQueue;
    for (auto node : nodeTags) {
        nodeTagsQueue.push(node);
    }
    std::unordered_set<react::Tag> visitedNodeTags;
    std::unordered_map<react::Tag, uint64_t> incomingEdgesCount;

    // first, we traverse the nodes graph to find all active nodes
    // and count incoming edges for each node
    while (!nodeTagsQueue.empty()) {
        auto tag = nodeTagsQueue.front();
        nodeTagsQueue.pop();

        if (visitedNodeTags.find(tag) != visitedNodeTags.end()) {
            continue;
        }

        visitedNodeTags.insert(tag);
        activeNodesCount++;

        auto &node = getNodeByTag(tag);

        for (auto childTag : node.getChildrenTags()) {
            nodeTagsQueue.push(childTag);
            incomingEdgesCount[childTag]++;
        }
    }

    // second, we visit all active nodeTags with no incoming edges
    // (meaning they're either the root nodeTags, or their parents were already visited)
    // and perform the updates
    for (auto node : nodeTags) {
        if (incomingEdgesCount[node] == 0) {
            nodeTagsQueue.push(node);
        }
    }
    while (!nodeTagsQueue.empty()) {
        auto tag = nodeTagsQueue.front();
        nodeTagsQueue.pop();

        auto &node = getNodeByTag(tag);
        node.update();

        if (auto propsNode = dynamic_cast<PropsAnimatedNode *>(&node); propsNode != nullptr) {
            propsNode->updateView();
        }

        if (auto valueNode = dynamic_cast<ValueAnimatedNode *>(&node); valueNode != nullptr) {
            valueNode->onValueUpdate();
        }

        updatedNodesCount++;

        for (auto childTag : node.getChildrenTags()) {
            incomingEdgesCount[childTag]--;
            if (incomingEdgesCount[childTag] == 0) {
                nodeTagsQueue.push(childTag);
            }
        }
    }

    if (activeNodesCount != updatedNodesCount) {
        // if not all active nodes were updated, it means there's a cycle in the graph
        throw std::runtime_error(
            "There were " + std::to_string(activeNodesCount) + " active nodes, but only " + std::to_string(updatedNodesCount) + " were updated");
    }
}

void AnimatedNodesManager::stopAnimationsForNode(facebook::react::Tag tag) {
    std::vector<facebook::react::Tag> animationsToStop;
    for (auto &[animationId, driver] : m_animationById) {
        if (driver->getAnimatedValueTag() == tag) {
            animationsToStop.push_back(animationId);
        }
    }
    for (auto id : animationsToStop) {
        stopAnimation(id);
    }
}

void AnimatedNodesManager::maybeStartAnimations() {
    if (!m_isRunningAnimations) {
        auto now = std::chrono::high_resolution_clock::now();
        auto frameTime = std::chrono::duration_cast<std::chrono::nanoseconds>(now.time_since_epoch());
        runUpdates(frameTime.count());
    }
}

AnimatedNode &AnimatedNodesManager::getNodeByTag(facebook::react::Tag tag) {
    try {
        return *m_nodeByTag.at(tag);
    } catch (std::out_of_range &e) {
        std::throw_with_nested(std::out_of_range("Animated node with tag " + std::to_string(tag) + " does not exist"));
    }
}

ValueAnimatedNode &AnimatedNodesManager::getValueNodeByTag(facebook::react::Tag tag) {
    auto &node = getNodeByTag(tag);

    try {
        return dynamic_cast<ValueAnimatedNode &>(node);
    } catch (std::bad_cast &e) {
        std::throw_with_nested(std::out_of_range("Animated node with tag " + std::to_string(tag) + " is not a value node"));
    }
}

} // namespace rnoh
