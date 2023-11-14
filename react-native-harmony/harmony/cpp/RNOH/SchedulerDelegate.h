#pragma once
#include <react/renderer/scheduler/SchedulerDelegate.h>

#include "RNOH/MountingManager.h"

namespace rnoh {

class SchedulerDelegate : public facebook::react::SchedulerDelegate {
  public:
    SchedulerDelegate(MountingManager mountingManager)
        : mountingManager(std::move(mountingManager)){};

    ~SchedulerDelegate() = default;

    void schedulerDidFinishTransaction(facebook::react::MountingCoordinator::Shared mountingCoordinator) override {
        mountingManager.scheduleTransaction(mountingCoordinator);
    }

    void schedulerDidRequestPreliminaryViewAllocation(facebook::react::SurfaceId surfaceId, const facebook::react::ShadowNode &shadowView) override {}

    void schedulerDidDispatchCommand(
        const facebook::react::ShadowView &shadowView,
        std::string const &commandName,
        folly::dynamic const &args) override {
        mountingManager.dispatchCommand(shadowView.tag, commandName, args);
    }

    void schedulerDidSendAccessibilityEvent(const facebook::react::ShadowView &shadowView, std::string const &eventType) override {
    }

    void schedulerDidSetIsJSResponder(
        facebook::react::ShadowView const &shadowView, bool isJSResponder, bool blockNativeResponder) override {
        if (isJSResponder && blockNativeResponder) {
            mountingManager.dispatchCommand(shadowView.tag, "lockScrolling", {});
        } else {
            mountingManager.dispatchCommand(shadowView.tag, "unlockScrolling", {});
        }
    }
    MountingManager mountingManager;
};

} // namespace rnoh
