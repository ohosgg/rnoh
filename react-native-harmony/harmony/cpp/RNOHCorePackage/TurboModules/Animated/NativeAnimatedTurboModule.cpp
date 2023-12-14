#include "NativeAnimatedTurboModule.h"

#include <jsi/jsi/JSIDynamic.h>
#include <chrono>

using namespace facebook;

namespace rnoh {

jsi::Value startOperationBatch(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->startOperationBatch();
    return facebook::jsi::Value::undefined();
}

jsi::Value finishOperationBatch(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->finishOperationBatch();
    return facebook::jsi::Value::undefined();
}

jsi::Value createAnimatedNode(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    auto config = jsi::dynamicFromValue(rt, args[1]);
    self->createAnimatedNode(args[0].getNumber(), config);
    return facebook::jsi::Value::undefined();
}

jsi::Value updateAnimatedNodeConfig(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->updateAnimatedNodeConfig(args[0].getNumber(), args[1]);
    return facebook::jsi::Value::undefined();
}

jsi::Value getValue(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    auto value = self->getValue(args[0].getNumber());
    args[1].getObject(rt).getFunction(rt).call(rt, value);
    return facebook::jsi::Value::undefined();
}

jsi::Value startListeningToAnimatedNodeValue(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->startListeningToAnimatedNodeValue(rt, args[0].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value stopListeningToAnimatedNodeValue(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->stopListeningToAnimatedNodeValue(args[0].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value connectAnimatedNodes(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->connectAnimatedNodes(args[0].getNumber(), args[1].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value disconnectAnimatedNodes(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->disconnectAnimatedNodes(args[0].getNumber(), args[1].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value startAnimatingNode(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    auto animationId = args[0].getNumber();
    auto config = jsi::dynamicFromValue(rt, args[2]);
    if (args[3].isUndefined()) {
        self->startAnimatingNode(animationId, args[1].getNumber(), config, [self, &rt, animationId](bool finished) {
            self->emitAnimationEndedEvent(rt, animationId, finished);
        });
        return facebook::jsi::Value::undefined();
    }
    auto callback = std::make_shared<jsi::Function>(std::move(args[3].getObject(rt).getFunction(rt)));
    auto endCallback = [&rt, callback = std::move(callback)](bool finished) {
        auto result = jsi::Object(rt);
        result.setProperty(rt, "finished", jsi::Value(finished));
        callback->call(rt, { std::move(result) });
    };
    self->startAnimatingNode(args[0].getNumber(), args[1].getNumber(), config, std::move(endCallback));
    return facebook::jsi::Value::undefined();
}

jsi::Value stopAnimation(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->stopAnimation(args[0].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value setAnimatedNodeValue(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->setAnimatedNodeValue(args[0].getNumber(), args[1].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value setAnimatedNodeOffset(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->setAnimatedNodeOffset(args[0].getNumber(), args[1].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value flattenAnimatedNodeOffset(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->flattenAnimatedNodeOffset(args[0].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value extractAnimatedNodeOffset(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->extractAnimatedNodeOffset(args[0].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value connectAnimatedNodeToView(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->connectAnimatedNodeToView(args[0].getNumber(), args[1].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value disconnectAnimatedNodeFromView(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->disconnectAnimatedNodeFromView(args[0].getNumber(), args[1].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value restoreDefaultValues(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->restoreDefaultValues(args[0].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value dropAnimatedNode(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->dropAnimatedNode(args[0].getNumber());
    return facebook::jsi::Value::undefined();
}

jsi::Value addAnimatedEventToView(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    auto dynamicEventMapping = jsi::dynamicFromValue(rt, args[2]);
    self->addAnimatedEventToView(args[0].getNumber(), args[1].getString(rt).utf8(rt), dynamicEventMapping);
    return facebook::jsi::Value::undefined();
}

jsi::Value removeAnimatedEventFromView(
    facebook::jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const facebook::jsi::Value *args,
    size_t count) {
    auto self = static_cast<NativeAnimatedTurboModule *>(&turboModule);
    self->removeAnimatedEventFromView(args[0].getNumber(), args[1].getString(rt).utf8(rt), args[2].getNumber());
    return facebook::jsi::Value::undefined();
}

static void scheduleUpdate(long long timestamp, void *data) {
    auto self = static_cast<NativeAnimatedTurboModule *>(data);
    self->runUpdates();
}

NativeAnimatedTurboModule::NativeAnimatedTurboModule(const ArkTSTurboModule::Context ctx, const std::string name)
    : rnoh::ArkTSTurboModule(ctx, name),
      m_vsyncHandle("AnimatedTurboModule"),
      m_animatedNodesManager(
          [this] {
              m_ctx.taskExecutor->runTask(TaskThread::MAIN, [this] { m_vsyncHandle.requestFrame(rnoh::scheduleUpdate, this); });
          },
          [this](auto tag, auto props) {
              if (m_ctx.taskExecutor->isOnTaskThread(TaskThread::MAIN)) {
                this->setNativeProps(tag, props);
              } else {
                m_ctx.taskExecutor->runTask(TaskThread::MAIN, [this, tag, props] { this->setNativeProps(tag, props); });
              }
          }) {
    methodMap_ = {
        {"startOperationBatch", {0, rnoh::startOperationBatch}},
        {"finishOperationBatch", {0, rnoh::finishOperationBatch}},
        {"createAnimatedNode", {2, rnoh::createAnimatedNode}},
        {"updateAnimatedNodeConfig", {2, rnoh::updateAnimatedNodeConfig}},
        {"getValue", {2, rnoh::getValue}},
        {"connectAnimatedNodes", {2, rnoh::connectAnimatedNodes}},
        {"disconnectAnimatedNodes", {2, rnoh::disconnectAnimatedNodes}},
        {"startAnimatingNode", {4, rnoh::startAnimatingNode}},
        {"stopAnimation", {1, rnoh::stopAnimation}},
        {"setAnimatedNodeValue", {2, rnoh::setAnimatedNodeValue}},
        {"setAnimatedNodeOffset", {2, rnoh::setAnimatedNodeOffset}},
        {"flattenAnimatedNodeOffset", {1, rnoh::flattenAnimatedNodeOffset}},
        {"extractAnimatedNodeOffset", {1, rnoh::extractAnimatedNodeOffset}},
        {"connectAnimatedNodeToView", {2, rnoh::connectAnimatedNodeToView}},
        {"disconnectAnimatedNodeFromView", {2, rnoh::disconnectAnimatedNodeFromView}},
        {"restoreDefaultValues", {1, rnoh::restoreDefaultValues}},
        {"dropAnimatedNode", {1, rnoh::dropAnimatedNode}},
        {"addAnimatedEventToView", {3, rnoh::addAnimatedEventToView}},
        {"removeAnimatedEventFromView", {3, rnoh::removeAnimatedEventFromView}},
        {"startListeningToAnimatedNodeValue", {1, rnoh::startListeningToAnimatedNodeValue}},
        {"stopListeningToAnimatedNodeValue", {1, rnoh::stopListeningToAnimatedNodeValue}}};
}

NativeAnimatedTurboModule::~NativeAnimatedTurboModule() {
    if (m_initializedEventListener) {
        m_ctx.eventDispatcher->unregisterExpiredListeners();
    }
}

void NativeAnimatedTurboModule::startOperationBatch() {
}

void NativeAnimatedTurboModule::finishOperationBatch() {
}

void NativeAnimatedTurboModule::createAnimatedNode(react::Tag tag, folly::dynamic const &config) {
    auto lock = acquireLock();
    m_animatedNodesManager.createNode(tag, config);
}

void NativeAnimatedTurboModule::updateAnimatedNodeConfig(react::Tag tag, const jsi::Value &config) {
}

double NativeAnimatedTurboModule::getValue(react::Tag tag) {
    auto lock = acquireLock();
    auto value = m_animatedNodesManager.getValue(tag);
    return value;
}

void NativeAnimatedTurboModule::startListeningToAnimatedNodeValue(jsi::Runtime &rt, react::Tag tag) {
    auto lock = acquireLock();
    m_animatedNodesManager.startListeningToAnimatedNodeValue(tag, [this, tag, &rt](double value) {
        this->emitDeviceEvent(rt, "onAnimatedValueUpdate",
                              [tag, value](jsi::Runtime &rt, std::vector<jsi::Value> &args) {
                                  auto payload = jsi::Object(rt);
                                  payload.setProperty(rt, "tag", tag);
                                  payload.setProperty(rt, "value", value);
                                  args.push_back(std::move(payload));
                              });
    });
}

void NativeAnimatedTurboModule::stopListeningToAnimatedNodeValue(react::Tag tag) {
    auto lock = acquireLock();
    m_animatedNodesManager.stopListeningToAnimatedNodeValue(tag);
}

void NativeAnimatedTurboModule::connectAnimatedNodes(react::Tag parentNodeTag, react::Tag childNodeTag) {
    auto lock = acquireLock();
    m_animatedNodesManager.connectNodes(parentNodeTag, childNodeTag);
}

void NativeAnimatedTurboModule::disconnectAnimatedNodes(react::Tag parentNodeTag, react::Tag childNodeTag) {
    auto lock = acquireLock();
    m_animatedNodesManager.disconnectNodes(parentNodeTag, childNodeTag);
}

void NativeAnimatedTurboModule::startAnimatingNode(
    react::Tag animationId,
    react::Tag nodeTag,
    folly::dynamic const &config,
    std::function<void(bool)> &&endCallback) {
    auto jsThreadCallback = [jsInvoker = this->jsInvoker_, endCallback = std::move(endCallback)](bool finished) mutable {
        // callbacks passed from JS need to be called through the jsInvoker
        // to ensure proper handling by React
        jsInvoker->invokeAsync([finished, endCallback = std::move(endCallback)] { endCallback(finished); });
    };
    auto lock = acquireLock();
    m_animatedNodesManager.startAnimatingNode(animationId, nodeTag, config, std::move(jsThreadCallback));
}

void NativeAnimatedTurboModule::stopAnimation(react::Tag animationId) {
    auto lock = acquireLock();
    m_animatedNodesManager.stopAnimation(animationId);
}

void NativeAnimatedTurboModule::setAnimatedNodeValue(react::Tag nodeTag, double value) {
    auto lock = acquireLock();
    m_animatedNodesManager.setValue(nodeTag, value);
}

void NativeAnimatedTurboModule::setAnimatedNodeOffset(react::Tag nodeTag, double offset) {
    auto lock = acquireLock();
    m_animatedNodesManager.setOffset(nodeTag, offset);
}

void NativeAnimatedTurboModule::flattenAnimatedNodeOffset(react::Tag nodeTag) {
    auto lock = acquireLock();
    m_animatedNodesManager.flattenOffset(nodeTag);
}

void NativeAnimatedTurboModule::extractAnimatedNodeOffset(react::Tag nodeTag) {
    auto lock = acquireLock();
    m_animatedNodesManager.extractOffset(nodeTag);
}

void NativeAnimatedTurboModule::connectAnimatedNodeToView(react::Tag nodeTag, react::Tag viewTag) {
    auto lock = acquireLock();
    m_animatedNodesManager.connectNodeToView(nodeTag, viewTag);
}

void NativeAnimatedTurboModule::disconnectAnimatedNodeFromView(react::Tag nodeTag, react::Tag viewTag) {
    auto lock = acquireLock();
    m_animatedNodesManager.disconnectNodeFromView(nodeTag, viewTag);
}

void NativeAnimatedTurboModule::restoreDefaultValues(react::Tag nodeTag) {
}

void NativeAnimatedTurboModule::dropAnimatedNode(react::Tag tag) {
    auto lock = acquireLock();
    m_animatedNodesManager.dropNode(tag);
}

void NativeAnimatedTurboModule::addAnimatedEventToView(react::Tag viewTag, std::string const &eventName, folly::dynamic const &eventMapping) {
    auto lock = acquireLock();
    initializeEventListener();
    m_animatedNodesManager.addAnimatedEventToView(viewTag, eventName, eventMapping);
}

void NativeAnimatedTurboModule::removeAnimatedEventFromView(facebook::react::Tag viewTag, std::string const &eventName, facebook::react::Tag animatedValueTag) {
    auto lock = acquireLock();
    m_animatedNodesManager.removeAnimatedEventFromView(viewTag, eventName, animatedValueTag);
}

void NativeAnimatedTurboModule::addListener(const std::string &eventName) {
}

void NativeAnimatedTurboModule::removeListeners(double count) {
}

void NativeAnimatedTurboModule::runUpdates() {
    ArkJS arkJs(m_ctx.env);
    auto lock = this->acquireLock();
    try {
        auto now = std::chrono::high_resolution_clock::now();
        auto frameTime = std::chrono::duration_cast<std::chrono::nanoseconds>(now.time_since_epoch());
        this->m_animatedNodesManager.runUpdates(frameTime.count());
    } catch (std::exception &e) {
        LOG(ERROR) << "Error in animation update: " << e.what();
        m_vsyncHandle.requestFrame(rnoh::scheduleUpdate, this);
    }
}

void NativeAnimatedTurboModule::setNativeProps(facebook::react::Tag tag, folly::dynamic const &props) {
    ArkJS arkJs(m_ctx.env);
    auto napiTag = arkJs.createInt(tag);
    auto napiProps = arkJs.createFromDynamic(props);

    auto napiTurboModuleObject = arkJs.getObject(m_ctx.arkTsTurboModuleInstanceRef);
    napiTurboModuleObject.call("setViewProps", {napiTag, napiProps});
}

void NativeAnimatedTurboModule::emitAnimationEndedEvent(facebook::jsi::Runtime &rt, facebook::react::Tag animationId, bool finished) {
    emitDeviceEvent(rt, "onNativeAnimatedModuleAnimationFinished",
                    [animationId, finished](facebook::jsi::Runtime &rt, std::vector<jsi::Value> &args) {
                        jsi::Object param(rt);
                        param.setProperty(rt, "animationId", animationId);
                        param.setProperty(rt, "finished", finished);
                        args.emplace_back(std::move(param));
                    });
}

void NativeAnimatedTurboModule::handleEvent(EventEmitRequestHandler::Context const &ctx) {
    ArkJS arkJs(ctx.env);
    folly::dynamic payload = arkJs.getDynamic(ctx.payload);
    react::Tag tag = ctx.tag;
    auto eventName = ctx.eventName;

    auto lock = acquireLock();
    m_animatedNodesManager.handleEvent(tag, eventName, payload);
}

void NativeAnimatedTurboModule::initializeEventListener() {
    if (m_initializedEventListener) {
        return;
    }

    m_ctx.eventDispatcher->registerEventListener(shared_from_this());
    m_initializedEventListener = true;
}

} // namespace rnoh
