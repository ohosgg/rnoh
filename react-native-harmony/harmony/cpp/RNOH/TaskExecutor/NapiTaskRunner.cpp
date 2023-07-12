#include <atomic>
#include <uv.h>
#include <glog/logging.h>

#include "NapiTaskRunner.h"

namespace rnoh {

NapiTaskRunner::NapiTaskRunner(napi_env env) : env(env) {
    auto loop = getLoop();
    asyncHandle.data = static_cast<void*>(this);
    uv_async_init(loop, &asyncHandle, [](auto handle) {
        auto runner = static_cast<NapiTaskRunner *>(handle->data);
        std::queue<Task> tasksQueue;
        {
            std::unique_lock<std::mutex> lock(runner->tasksMutex);
            std::swap(tasksQueue, runner->tasksQueue);
        }
        while (!tasksQueue.empty()) {
            auto task = std::move(tasksQueue.front());
            tasksQueue.pop();
            task();
        }
    });
}

NapiTaskRunner::~NapiTaskRunner() {
    uv_close(reinterpret_cast<uv_handle_t *>(&asyncHandle), nullptr);
}

void NapiTaskRunner::runAsyncTask(Task &&task) {
    std::unique_lock<std::mutex> lock(tasksMutex);
    tasksQueue.push(task);
    uv_async_send(&asyncHandle);
}

void NapiTaskRunner::runSyncTask(Task &&task) {
    std::condition_variable cv;
    std::unique_lock<std::mutex> lock(tasksMutex);
    std::atomic_bool done{false};
    tasksQueue.push([&cv, &done, task = std::move(task)]() {
        task();
        done = true;
        cv.notify_all();
    });
    uv_async_send(&asyncHandle);
    cv.wait(lock, [&done] { return done.load(); });
}

uv_loop_t *NapiTaskRunner::getLoop() const {
    uv_loop_t *loop = nullptr;
    napi_get_uv_event_loop(env, &loop);
    return loop;
}

} // namespace rnoh
