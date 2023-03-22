#include <glog/logging.h>

#include "MountingManager.h"

namespace rnoh {

using namespace facebook::react;

void MountingManager::performMountInstructions(react::ShadowViewMutationList const &mutations, react::SurfaceId surfaceId) {
    for (auto &mutation : mutations) {
        switch (mutation.type) {
        case ShadowViewMutation::Create: {
            auto newChild = mutation.newChildShadowView;
            LOG(INFO) << "CREATE mutation for tag: " << newChild.tag;
            break;
        }
        case ShadowViewMutation::Delete: {
            auto oldChild = mutation.oldChildShadowView;
            LOG(INFO) << "DELETE mutation for tag: " << oldChild.tag;
            break;
        }
        case ShadowViewMutation::Insert: {
            auto newChild = mutation.newChildShadowView;
            auto parent = mutation.parentShadowView;
            LOG(INFO) << "INSERT mutation for tag: " << newChild.tag << " to parent: " << parent.tag;
            break;
        }
        case ShadowViewMutation::Remove: {
            auto oldChild = mutation.oldChildShadowView;
            auto parent = mutation.parentShadowView;
            LOG(INFO) << "REMOVE mutation for tag: " << oldChild.tag << " from parent: " << parent.tag;
            break;
        }
        case ShadowViewMutation::Update: {
            auto newChild = mutation.newChildShadowView;
            LOG(INFO) << "UPDATE mutation for tag: " << newChild.tag;
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
        [this](MountingTransaction const &transaction, SurfaceTelemetry const &surfaceTelemetry) {
            // Will mount
        },
        [this, surfaceId](MountingTransaction const &transaction, SurfaceTelemetry const &surfaceTelemetry) {
            // Mounting
            performMountInstructions(transaction.getMutations(), surfaceId);
        },
        [this](MountingTransaction const &transaction, SurfaceTelemetry const &surfaceTelemetry) {
            // Did mount
            this->triggerUICallback(transaction.getMutations());
        });
}
} // namespace rnoh