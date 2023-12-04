#pragma once

#include <functional>

#include <react/renderer/components/root/RootShadowNode.h>
#include <react/renderer/components/modal/ModalHostViewState.h>
#include <react/renderer/core/LayoutableShadowNode.h>
#include <react/renderer/core/RawProps.h>
#include <react/renderer/core/ReactPrimitives.h>
#include <react/renderer/mounting/MountingCoordinator.h>
#include <react/renderer/mounting/TelemetryController.h>

#include "RNOH/MutationsToNapiConverter.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"
#include "RNOH/ShadowViewRegistry.h"

namespace rnoh {

class MountingManager {
  public:
    using TriggerUICallback = std::function<void(
      std::unordered_map<facebook::react::Tag, folly::dynamic> &preallocatedViewRawPropsByTag,
      facebook::react::ShadowViewMutationList const &mutations)
    >;
    using CommandDispatcher = std::function<void(facebook::react::Tag tag, std::string const &commandName, folly::dynamic const args)>;

    MountingManager(TaskExecutor::Shared taskExecutor, ShadowViewRegistry::Shared shadowViewRegistry, TriggerUICallback &&triggerUICallback, CommandDispatcher &&commandDispatcher)
        : taskExecutor(std::move(taskExecutor)),
          shadowViewRegistry(std::move(shadowViewRegistry)),
          triggerUICallback(std::move(triggerUICallback)),
          commandDispatcher(std::move(commandDispatcher)) {}

    void performMountInstructions(facebook::react::ShadowViewMutationList const &mutations, facebook::react::SurfaceId surfaceId);

    void scheduleTransaction(facebook::react::MountingCoordinator::Shared const &mountingCoordinator);

    void performTransaction(facebook::react::MountingCoordinator::Shared const &mountingCoordinator);

    void dispatchCommand(facebook::react::Tag tag, std::string const &commandName, folly::dynamic const args);
    
    void preallocateView(const facebook::react::ShadowNode &shadowView);

  private:
    TaskExecutor::Shared taskExecutor;
    ShadowViewRegistry::Shared shadowViewRegistry;
    TriggerUICallback triggerUICallback;
    CommandDispatcher commandDispatcher;
    std::unordered_map<facebook::react::Tag, folly::dynamic> m_preallocatedViewRawPropsByTag;
};

} // namespace rnoh