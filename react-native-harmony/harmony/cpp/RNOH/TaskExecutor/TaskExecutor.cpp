#include <uv.h>
#include <glog/logging.h>

#include "TaskExecutor.h"
#include "ThreadTaskRunner.h"
#include "NapiTaskRunner.h"

namespace rnoh {

TaskExecutor::TaskExecutor(napi_env mainEnv) {
    auto mainTaskRunner = std::make_shared<NapiTaskRunner>(mainEnv);
    auto jsTaskRunner = std::make_shared<ThreadTaskRunner>("RNOH_JS");
    // NOTE: we merge MAIN and BG threads for now,
    // to allow for calling MAIN->BG->MAIN synchronously without deadlocks
    m_taskRunners = {
        mainTaskRunner,
        jsTaskRunner,
        mainTaskRunner};
}

void TaskExecutor::runTask(TaskThread thread, Task &&task) {
    m_taskRunners[thread]->runAsyncTask(std::move(task));
}

void TaskExecutor::runSyncTask(TaskThread thread, Task &&task) {
    m_taskRunners[thread]->runSyncTask(std::move(task));
}

bool TaskExecutor::isOnTaskThread(TaskThread thread) const {
    return m_taskRunners[thread]->isOnCurrentThread();
}

} // namespace rnoh
