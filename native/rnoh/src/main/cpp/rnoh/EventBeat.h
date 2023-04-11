#include <ReactCommon/RuntimeExecutor.h>
#include <react/renderer/core/EventBeat.h>
#include "RNOH/TaskExecutor.h"

class RNOHEventBeat : public facebook::react::EventBeat {
  public:
    RNOHEventBeat(std::weak_ptr<rnoh::TaskExecutor> const &taskExecutor, facebook::react::RuntimeExecutor runtimeExecutor, SharedOwnerBox ownerBox)
        : m_taskExecutor(taskExecutor), m_runtimeExecutor(runtimeExecutor), EventBeat(ownerBox) {
    }

    void induce() const override {
        if (!this->isRequested_) {
            return;
        }

        if (auto taskExecutor = m_taskExecutor.lock()) {
            taskExecutor->runTask(rnoh::TaskThread::BACKGROUND, [this]() {
                this->m_runtimeExecutor([this](facebook::jsi::Runtime &runtime) {
                    beat(runtime);
                });
            });
        }
    }

    void request() const override {
        EventBeat::request();
        induce();
    }

    ~RNOHEventBeat() override = default;

  private:
    std::weak_ptr<rnoh::TaskExecutor> m_taskExecutor;
    facebook::react::RuntimeExecutor m_runtimeExecutor;
};