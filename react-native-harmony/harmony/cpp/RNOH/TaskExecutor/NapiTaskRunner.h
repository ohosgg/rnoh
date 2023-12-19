#pragma once

#include <atomic>
#include <thread>
#include <queue>
#include <mutex>
#include <functional>
#include <napi/native_api.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <uv.h>

#include "AbstractTaskRunner.h"

namespace rnoh {

class NapiTaskRunner : public AbstractTaskRunner  {
  public:
    NapiTaskRunner(napi_env env);
    ~NapiTaskRunner() override;

    NapiTaskRunner(const NapiTaskRunner &) = delete;
    NapiTaskRunner &operator=(const NapiTaskRunner &) = delete;

    void runAsyncTask(Task &&task) override;
    void runSyncTask(Task &&task) override;

    bool isOnCurrentThread() const override;

  private:
    napi_env env;
    uv_loop_t *getLoop() const;

    uv_async_t asyncHandle;
    std::mutex tasksMutex;
    std::queue<Task> tasksQueue;
    std::thread::id threadId;
    std::condition_variable cv;
    std::shared_ptr<std::atomic_bool> running = std::make_shared<std::atomic_bool>(true);
};

} // namespace rnoh
