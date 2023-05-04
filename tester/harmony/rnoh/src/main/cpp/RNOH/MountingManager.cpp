#include "RNOH/MountingManager.h"

#include <glog/logging.h>

namespace rnoh {

using namespace facebook;

void MountingManager::performMountInstructions(react::ShadowViewMutationList const &mutations, react::SurfaceId surfaceId) {
    for (auto &mutation : mutations) {
        switch (mutation.type) {
        case react::ShadowViewMutation::Create: {
            auto newChild = mutation.newChildShadowView;

            eventEmitterRegistry->setEventEmitter(newChild.tag, newChild.eventEmitter);
            break;
        }
        case react::ShadowViewMutation::Delete: {
            auto oldChild = mutation.oldChildShadowView;

            eventEmitterRegistry->clearEventEmitter(oldChild.tag);
            break;
        }
        case react::ShadowViewMutation::Insert: {
            auto newChild = mutation.newChildShadowView;
            auto parent = mutation.parentShadowView;
            break;
        }
        case react::ShadowViewMutation::Remove: {
            auto oldChild = mutation.oldChildShadowView;
            auto parent = mutation.parentShadowView;
            break;
        }
        case react::ShadowViewMutation::Update: {
            auto newChild = mutation.newChildShadowView;

            eventEmitterRegistry->setEventEmitter(newChild.tag, newChild.eventEmitter);
            break;
        }
        }
    }
}

void MountingManager::scheduleTransaction(react::MountingCoordinator::Shared const &mountingCoordinator) {
    taskExecutor->runTask(TaskThread::MAIN, [this, mountingCoordinator] {
        performTransaction(mountingCoordinator);
    });
}

void MountingManager::performTransaction(facebook::react::MountingCoordinator::Shared const &mountingCoordinator) {
    auto surfaceId = mountingCoordinator->getSurfaceId();

    mountingCoordinator->getTelemetryController().pullTransaction(
        [this](react::MountingTransaction const &transaction, react::SurfaceTelemetry const &surfaceTelemetry) {
            // Will mount
        },
        [this, surfaceId](react::MountingTransaction const &transaction, react::SurfaceTelemetry const &surfaceTelemetry) {
            // Mounting
            performMountInstructions(transaction.getMutations(), surfaceId);
        },
        [this](react::MountingTransaction const &transaction, react::SurfaceTelemetry const &surfaceTelemetry) {
            // Did mount
            this->triggerUICallback(transaction.getMutations());
        });
}

void MountingManager::dispatchCommand(facebook::react::Tag tag, std::string const &commandName, folly::dynamic const args) {
    this->commandDispatcher(tag, commandName, args);
}
} // namespace rnoh