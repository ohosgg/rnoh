#include <atomic>
#include <uv.h>
#include <napi/native_api.h>
#include <glog/logging.h>

#include "NapiTaskRunner.h"

namespace rnoh {

NapiTaskRunner::NapiTaskRunner(napi_env env) : env(env) {
    // NOTE: let's hope the JS runtime doesn't move between system threads...
    threadId = std::this_thread::get_id();
    auto loop = getLoop();
    asyncHandle.data = static_cast<void *>(this);
    uv_async_init(loop, &asyncHandle, [](auto handle) {
        auto runner = static_cast<NapiTaskRunner *>(handle->data);

        // https://nodejs.org/api/n-api.html#napi_handle_scope
        // "For any invocations of code outside the execution of a native method (...)
        // the module is required to create a scope before invoking any functions
        // that can result in the creation of JavaScript values"
        napi_handle_scope scope;
        auto result = napi_open_handle_scope(runner->env, &scope);
        if (result != napi_ok) {
            LOG(ERROR) << "Failed to open handle scope";
            return;
        }

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

        result = napi_close_handle_scope(runner->env, scope);
        if (result != napi_ok) {
            LOG(ERROR) << "Failed to close handle scope";
            return;
        }
    });
}

NapiTaskRunner::~NapiTaskRunner() {
    running->store(false);
    cv.notify_all();
    uv_close(reinterpret_cast<uv_handle_t *>(&asyncHandle), nullptr);
}

void NapiTaskRunner::runAsyncTask(Task &&task) {
    std::unique_lock<std::mutex> lock(tasksMutex);
    tasksQueue.push(task);
    uv_async_send(&asyncHandle);
}

void NapiTaskRunner::runSyncTask(Task &&task) {
    if (isOnCurrentThread()) {
        task();
        return;
    }
    std::unique_lock<std::mutex> lock(tasksMutex);
    std::atomic_bool done{false};
    tasksQueue.push([this, &done, task = std::move(task)]() {
        task();
        done = true;
        cv.notify_all();
    });
    uv_async_send(&asyncHandle);
    cv.wait(lock, [running = this->running, &done] { return !(running->load()) || done.load(); });
}

bool NapiTaskRunner::isOnCurrentThread() const {
    return threadId == std::this_thread::get_id();
}

uv_loop_t *NapiTaskRunner::getLoop() const {
    uv_loop_t *loop = nullptr;
    napi_get_uv_event_loop(env, &loop);
    return loop;
}

} // namespace rnoh
