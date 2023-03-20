#pragma once

#include <thread>
#include <queue>
#include <mutex>
#include <functional>
#include <napi/native_api.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <uv.h>

#include "TaskRunner.h"

namespace rnoh {

enum TaskThread {
    MAIN,       // main thread running the eTS event loop
    JS,         // React Native's JS runtime thread
    BACKGROUND  // background tasks queue
};

class TaskExecutor {
public:
    using Task = std::function<void()>;

    TaskExecutor(napi_env env);
    ~TaskExecutor();

    void runTask(TaskThread thread, Task &&task);
    void runSyncTask(TaskThread thread, Task &&task);

private:
    napi_env env;
    uv_loop_t *getLoop() const;

    TaskRunner jsTaskRunner = TaskRunner("JS");
    TaskRunner backgroundTaskRunner = TaskRunner("BACKGROUND");

    uv_async_t asyncHandle;
    std::mutex mainThreadTasksMutex;
    std::queue<Task> mainThreadTasks;
};

}
