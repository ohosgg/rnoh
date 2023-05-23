#pragma once

#include <atomic>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>

namespace rnoh {

class TaskRunner {
  public:
    using Task = std::function<void()>;

    TaskRunner(std::string name);
    ~TaskRunner();

    void runAsyncTask(Task &&task);
    void runSyncTask(Task &&task);

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