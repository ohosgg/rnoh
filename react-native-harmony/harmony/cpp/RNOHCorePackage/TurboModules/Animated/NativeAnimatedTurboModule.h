#pragma once

#include <mutex>
#include <react/renderer/core/ReactPrimitives.h>
#include <RNOH/ArkTSTurboModule.h>
#include <folly/dynamic.h>

#include "AnimatedNodesManager.h"

namespace rnoh {

class NativeAnimatedTurboModule : public rnoh::ArkTSTurboModule {

public:
    NativeAnimatedTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);

    void startOperationBatch();

    void finishOperationBatch();

    void createAnimatedNode(facebook::react::Tag tag, folly::dynamic const &config);

    void updateAnimatedNodeConfig(facebook::react::Tag tag, facebook::jsi::Value const &config);

    double getValue(facebook::react::Tag tag);

    void startListeningToAnimatedNodeValue(facebook::react::Tag tag);

    void stopListeningToAnimatedNodeValue(facebook::react::Tag tag);

    void connectAnimatedNodes(facebook::react::Tag parentTag, facebook::react::Tag childTag);

    void disconnectAnimatedNodes(facebook::react::Tag parentTag, facebook::react::Tag childTag);

    void startAnimatingNode(
        facebook::react::Tag animationId,
        facebook::react::Tag nodeTag,
        folly::dynamic const &config,
        std::function<void(bool)> &&endCallback);
    
    void stopAnimation(facebook::react::Tag animationId);

    void setAnimatedNodeValue(facebook::react::Tag nodeTag, double value);

    void setAnimatedNodeOffset(facebook::react::Tag nodeTag, double offset);

    void flattenAnimatedNodeOffset(facebook::react::Tag nodeTag);

    void extractAnimatedNodeOffset(facebook::react::Tag nodeTag);

    void connectAnimatedNodeToView(facebook::react::Tag nodeTag, facebook::react::Tag viewTag);

    void disconnectAnimatedNodeFromView(facebook::react::Tag nodeTag, facebook::react::Tag viewTag);

    void restoreDefaultValues(facebook::react::Tag nodeTag);

    void dropAnimatedNode(facebook::react::Tag tag);

    void addAnimatedEventToView(facebook::react::Tag viewTag, std::string const &eventName, facebook::jsi::Value const &eventMapping);

    void removeAnimatedEventFromView(facebook::react::Tag viewTag, std::string const &eventName, facebook::react::Tag animatedValueTag);

    void addListener(std::string const &eventName);

    void removeListeners(double count);

    void scheduleUpdate();

    void setNativeProps(facebook::react::Tag tag, folly::dynamic const &props);

    void emitAnimationEndedEvent(facebook::jsi::Runtime &rt, facebook::react::Tag animationId, bool completed);

private:
    std::unique_lock<std::mutex> acquireLock() {
        return std::unique_lock(m_nodesManagerLock);
    }
    
    AnimatedNodesManager m_animatedNodesManager;
    std::mutex m_nodesManagerLock;
};
    
} // namespace rnoh