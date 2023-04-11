#include <uv.h>
#include <glog/logging.h>

#include "RNOH/TaskExecutor.h"
#include "RNOH/TaskRunner.h"

namespace rnoh{

TaskExecutor::TaskExecutor(napi_env env) : env(env) {
    auto loop = getLoop();
    asyncHandle.data = (void*)this;
    uv_async_init(loop, &asyncHandle, [](auto handle) {
        auto executor = static_cast<TaskExecutor*>(handle->data);
        std::unique_lock<std::mutex> lock(executor->mainThreadTasksMutex);

        while (!executor->mainThreadTasks.empty()) {
            auto task = std::move(executor->mainThreadTasks.front());
            executor->mainThreadTasks.pop();
            task();
        }
    });
}

TaskExecutor::~TaskExecutor() {
    uv_close(reinterpret_cast<uv_handle_t*>(&asyncHandle), nullptr);
}

void TaskExecutor::runTask(TaskThread thread, Task &&task) {
    switch (thread) {
        case TaskThread::MAIN:
        {
            std::unique_lock<std::mutex> lock(mainThreadTasksMutex);
            mainThreadTasks.push(task);
            uv_async_send(&asyncHandle);
            return;
        }
        case TaskThread::JS:
        {
            jsTaskRunner.runAsyncTask(std::move(task));
            return;
        }
        case TaskThread::BACKGROUND:
        {
            backgroundTaskRunner.runAsyncTask(std::move(task));
            return;
        }
    }
}

void TaskExecutor::runSyncTask(TaskThread thread, Task &&task) {
    switch (thread) {
        case TaskThread::MAIN: {
            std::condition_variable cv;
            std::unique_lock<std::mutex> lock(mainThreadTasksMutex);
            mainThreadTasks.push([&cv, task = std::move(task)]() {
                task();
                cv.notify_one();
            });
            uv_async_send(&asyncHandle);
            cv.wait(lock);
            return;
        }
        break;
        case TaskThread::JS:
            jsTaskRunner.runSyncTask(std::move(task));
        break;
        case TaskThread::BACKGROUND:
            backgroundTaskRunner.runSyncTask(std::move(task));
        break;
    }
}

uv_loop_t *TaskExecutor::getLoop() const {
    uv_loop_t *loop = nullptr;
    napi_get_uv_event_loop(env, &loop);
    return loop;
}

}
