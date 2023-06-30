#pragma once

#include <functional>

#include <react/renderer/components/root/RootShadowNode.h>
#include <react/renderer/core/LayoutableShadowNode.h>
#include <react/renderer/core/RawProps.h>
#include <react/renderer/core/ReactPrimitives.h>
#include <react/renderer/mounting/MountingCoordinator.h>
#include <react/renderer/mounting/TelemetryController.h>

#include "RNOH/MutationsToNapiConverter.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"
#include "RNOH/EventEmitterRegistry.h"

namespace rnoh {

class MountingManager {
  public:
    using TriggerUICallback = std::function<void(facebook::react::ShadowViewMutationList const &mutations)>;
    using CommandDispatcher = std::function<void(facebook::react::Tag tag, std::string const &commandName, folly::dynamic const args)>;

    MountingManager(TaskExecutor::Shared taskExecutor, EventEmitterRegistry::Shared eventEmitterRegistry, TriggerUICallback triggerUICallback, CommandDispatcher commandDispatcher)
        : taskExecutor(std::move(taskExecutor)),
          eventEmitterRegistry(std::move(eventEmitterRegistry)),
          triggerUICallback(std::move(triggerUICallback)),
          commandDispatcher(std::move(commandDispatcher)) {}

    void performMountInstructions(facebook::react::ShadowViewMutationList const &mutations, facebook::react::SurfaceId surfaceId);

    void scheduleTransaction(facebook::react::MountingCoordinator::Shared const &mountingCoordinator);

    void performTransaction(facebook::react::MountingCoordinator::Shared const &mountingCoordinator);

    void dispatchCommand(facebook::react::Tag tag, std::string const &commandName, folly::dynamic const args);

  private:
    TaskExecutor::Shared taskExecutor;
    EventEmitterRegistry::Shared eventEmitterRegistry;
    TriggerUICallback triggerUICallback;
    CommandDispatcher commandDispatcher;
};

} // namespace rnoh