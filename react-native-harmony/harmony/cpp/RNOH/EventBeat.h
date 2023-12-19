#include <ReactCommon/RuntimeExecutor.h>
#include <react/renderer/core/EventBeat.h>
#include "RNOH/TaskExecutor/TaskExecutor.h"

namespace rnoh {

class EventBeat : public facebook::react::EventBeat {
  public:
    EventBeat(std::weak_ptr<TaskExecutor> const &taskExecutor, facebook::react::RuntimeExecutor runtimeExecutor, SharedOwnerBox ownerBox)
        : m_taskExecutor(taskExecutor), m_runtimeExecutor(runtimeExecutor), facebook::react::EventBeat(ownerBox) {
    }

    void induce() const override {
        if (!this->isRequested_) {
            return;
        }

        this->m_runtimeExecutor([this](facebook::jsi::Runtime &runtime) {
            beat(runtime);
        });
    }

    void request() const override {
        facebook::react::EventBeat::request();
        induce();
    }

    ~EventBeat() override = default;

  private:
    std::weak_ptr<TaskExecutor> m_taskExecutor;
    facebook::react::RuntimeExecutor m_runtimeExecutor;
};

} // namespace rnoh