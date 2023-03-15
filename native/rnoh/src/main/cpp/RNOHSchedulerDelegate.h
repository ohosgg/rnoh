#ifndef native_RNOHSchedulerDelegate_H
#define native_RNOHSchedulerDelegate_H
#include <react/renderer/scheduler/SchedulerDelegate.h>

using namespace facebook::react;

class RNOHSchedulerDelegate : public SchedulerDelegate {
  public:
    RNOHSchedulerDelegate() = default;
    
    ~RNOHSchedulerDelegate() = default;

    void schedulerDidFinishTransaction(MountingCoordinator::Shared const &mountingCoordinator) override {
    }

    void schedulerDidRequestPreliminaryViewAllocation(SurfaceId surfaceId, const ShadowNode &shadowView) override {}

    void schedulerDidDispatchCommand(
        const ShadowView &shadowView, std::string const &commandName, folly::dynamic const &args) override {
    }

    void schedulerDidSendAccessibilityEvent(const ShadowView &shadowView, std::string const &eventType) override {
    }

    void schedulerDidSetIsJSResponder(
        ShadowView const &shadowView, bool isJSResponder, bool blockNativeResponder) override {}
};

#endif //native_RNOHSchedulerDelegate
