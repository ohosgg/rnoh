#pragma once
#include <array>
#include <memory>
#include <optional>
#include <napi/native_api.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <uv.h>
#include "AbstractTaskRunner.h"

namespace rnoh {

enum TaskThread {
    MAIN = 0,   // main thread running the eTS event loop
    JS,         // React Native's JS runtime thread
    BACKGROUND, // background tasks queue
};

class TaskExecutor {
  public:
    using Task = AbstractTaskRunner::Task;
    using Shared = std::shared_ptr<TaskExecutor>;
    using Weak = std::weak_ptr<TaskExecutor>;

    TaskExecutor(napi_env mainEnv);

    void runTask(TaskThread thread, Task &&task);
    void runSyncTask(TaskThread thread, Task &&task);

    bool isOnTaskThread(TaskThread thread) const;

    std::optional<TaskThread> getCurrentTaskThread() const;

  private:
    std::array<std::shared_ptr<AbstractTaskRunner>, TaskThread::BACKGROUND + 1> m_taskRunners;
    std::array<std::optional<TaskThread>, TaskThread::BACKGROUND + 1> m_waitsOnThread;
};

} // namespace rnoh
