#pragma once

#include <atomic>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>

#include "AbstractTaskRunner.h"

namespace rnoh {

class ThreadTaskRunner : public AbstractTaskRunner {
  public:
    ThreadTaskRunner(std::string name);
    ~ThreadTaskRunner() override;

    void runAsyncTask(Task &&task) override;
    void runSyncTask(Task &&task) override;

  private:
    void runLoop();

    bool hasPendingTasks() const {
        return !asyncTaskQueue.empty() || !syncTaskQueue.empty();
    }

    std::string name;
    std::atomic_bool running{true};
    std::thread thread;
    std::queue<std::function<void()>> asyncTaskQueue;
    std::queue<std::function<void()>> syncTaskQueue;
    std::mutex mutex;
    std::condition_variable cv;
};

} // namespace rnoh