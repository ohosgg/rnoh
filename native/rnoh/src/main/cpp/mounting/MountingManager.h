#pragma once
#include <functional>

#include <react/renderer/components/root/RootShadowNode.h>
#include <react/renderer/core/LayoutableShadowNode.h>
#include <react/renderer/core/RawProps.h>
#include <react/renderer/core/ReactPrimitives.h>
#include <react/renderer/mounting/MountingCoordinator.h>
#include <react/renderer/mounting/TelemetryController.h>

#include "TaskExecutor/TaskExecutor.h"

namespace rnoh {

using namespace facebook;

class MountingManager {
  public:
    using TriggerUICallback = std::function<void()>;

    MountingManager(TaskExecutor::Shared taskExecutor, TriggerUICallback triggerUICallback)
        : taskExecutor(std::move(taskExecutor)), triggerUICallback(std::move(triggerUICallback)) {}

    void performMountInstructions(react::ShadowViewMutationList const &mutations, react::SurfaceId surfaceId);

    void scheduleTransaction(react::MountingCoordinator::Shared const &mountingCoordinator);

    void performTransaction(facebook::react::MountingCoordinator::Shared const &mountingCoordinator);

  private:
    TaskExecutor::Shared taskExecutor;
    TriggerUICallback triggerUICallback;
};

} // namespace rnoh