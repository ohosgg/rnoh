#include <uv.h>
#include <glog/logging.h>

#include "TaskExecutor.h"
#include "ThreadTaskRunner.h"
#include "NapiTaskRunner.h"

namespace rnoh {

TaskExecutor::TaskExecutor(napi_env mainEnv, napi_env workerEnv) 
    : m_taskRunners({
        std::make_unique<NapiTaskRunner>(mainEnv),
        std::make_unique<ThreadTaskRunner>("RNOH_JS"),
        std::make_unique<ThreadTaskRunner>("RNOH_BACKGROUND"),
        std::make_unique<NapiTaskRunner>(workerEnv)
    }) {}

void TaskExecutor::runTask(TaskThread thread, Task &&task) {
    m_taskRunners[thread]->runAsyncTask(std::move(task));
}

void TaskExecutor::runSyncTask(TaskThread thread, Task &&task) {
    m_taskRunners[thread]->runSyncTask(std::move(task));
}

} // namespace rnoh
