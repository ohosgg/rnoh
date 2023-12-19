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
    auto waitsOnThread = m_waitsOnThread[thread];
    if (waitsOnThread.has_value() && isOnTaskThread(waitsOnThread.value())) {
        throw std::runtime_error("Deadlock detected");
    }
    auto currentThread = getCurrentTaskThread();
    if (currentThread.has_value()) {
        m_waitsOnThread[currentThread.value()] = thread;
    }
    m_taskRunners[thread]->runSyncTask(std::move(task));
    if (currentThread.has_value()) {
        m_waitsOnThread[currentThread.value()] = std::nullopt;
    }
}

bool TaskExecutor::isOnTaskThread(TaskThread thread) const {
    return m_taskRunners[thread]->isOnCurrentThread();
}

std::optional<TaskThread> TaskExecutor::getCurrentTaskThread() const {
    if (isOnTaskThread(TaskThread::MAIN)) {
        return TaskThread::MAIN;
    } else if (isOnTaskThread(TaskThread::JS)) {
        return TaskThread::JS;
    } else if (isOnTaskThread(TaskThread::BACKGROUND)) {
        return TaskThread::BACKGROUND;
    } else {
        return std::nullopt;
    }
}

} // namespace rnoh
