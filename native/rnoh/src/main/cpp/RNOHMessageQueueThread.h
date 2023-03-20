#ifndef native_RNOHMessageQueueThread_H
#define native_RNOHMessageQueueThread_H
#include <cxxreact/MessageQueueThread.h>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>

#include "TaskExecutor/TaskExecutor.h"

class RNOHMessageQueueThread : public facebook::react::MessageQueueThread {
  public:
    RNOHMessageQueueThread(std::shared_ptr<rnoh::TaskExecutor> const &taskExecutor);
    virtual ~RNOHMessageQueueThread();

    void runOnQueue(std::function<void()> &&func) override;

    void runOnQueueSync(std::function<void()> &&func) override;

    void quitSynchronous() override;

  private:
    std::shared_ptr<rnoh::TaskExecutor> taskExecutor;
};

#endif //native_RNOHMessageQueueThread_H
