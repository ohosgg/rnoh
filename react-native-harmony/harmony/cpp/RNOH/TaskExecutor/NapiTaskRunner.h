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

    void runAsyncTask(Task &&task) override;
    void runSyncTask(Task &&task) override;

  private:
    napi_env env;
    uv_loop_t *getLoop() const;

    uv_async_t asyncHandle;
    std::mutex tasksMutex;
    std::queue<Task> tasksQueue;
    std::thread::id threadId;
};

} // namespace rnoh
