#ifndef native_RNOHSchedulerDelegate_H
#define native_RNOHSchedulerDelegate_H
#include <react/renderer/scheduler/SchedulerDelegate.h>

#include "RNOH/MountingManager.h"

using namespace facebook::react;

class RNOHSchedulerDelegate : public SchedulerDelegate {
  public:
    RNOHSchedulerDelegate(rnoh::MountingManager mountingManager)
        : mountingManager(std::move(mountingManager)){};

    ~RNOHSchedulerDelegate() = default;

    void schedulerDidFinishTransaction(MountingCoordinator::Shared const &mountingCoordinator) override {
        mountingManager.scheduleTransaction(mountingCoordinator);
    }

    void schedulerDidRequestPreliminaryViewAllocation(SurfaceId surfaceId, const ShadowNode &shadowView) override {}

    void schedulerDidDispatchCommand(
        const ShadowView &shadowView, std::string const &commandName, folly::dynamic const &args) override {
    }

    void schedulerDidSendAccessibilityEvent(const ShadowView &shadowView, std::string const &eventType) override {
    }

    void schedulerDidSetIsJSResponder(
        ShadowView const &shadowView, bool isJSResponder, bool blockNativeResponder) override {}

  private:
    rnoh::MountingManager mountingManager;
};

#endif // native_RNOHSchedulerDelegate
