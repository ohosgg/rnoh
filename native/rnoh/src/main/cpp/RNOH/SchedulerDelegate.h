#pragma once
#include <react/renderer/scheduler/SchedulerDelegate.h>

#include "RNOH/MountingManager.h"

namespace rnoh {

class SchedulerDelegate : public facebook::react::SchedulerDelegate {
  public:
    SchedulerDelegate(MountingManager mountingManager)
        : mountingManager(std::move(mountingManager)){};

    ~SchedulerDelegate() = default;

    void schedulerDidFinishTransaction(react::MountingCoordinator::Shared const &mountingCoordinator) override {
        mountingManager.scheduleTransaction(mountingCoordinator);
    }

    void schedulerDidRequestPreliminaryViewAllocation(react::SurfaceId surfaceId, const react::ShadowNode &shadowView) override {}

    void schedulerDidDispatchCommand(
        const react::ShadowView &shadowView,
        std::string const &commandName,
        folly::dynamic const &args) override {
        mountingManager.dispatchCommand(shadowView.tag, commandName, args);
    }

    void schedulerDidSendAccessibilityEvent(const react::ShadowView &shadowView, std::string const &eventType) override {
    }

    void schedulerDidSetIsJSResponder(
        react::ShadowView const &shadowView, bool isJSResponder, bool blockNativeResponder) override {}

  private:
    MountingManager mountingManager;
};

} // namespace rnoh
