#include "RNOH/MessageQueueThread.h"

using namespace rnoh;

MessageQueueThread::MessageQueueThread(std::shared_ptr<TaskExecutor> const &taskExecutor)
    : taskExecutor(taskExecutor) {}

MessageQueueThread::~MessageQueueThread(){};

void MessageQueueThread::runOnQueue(std::function<void()> &&func) {
    taskExecutor->runTask(TaskThread::JS, std::move(func));
}

void MessageQueueThread::runOnQueueSync(std::function<void()> &&func) {
    taskExecutor->runSyncTask(TaskThread::JS, std::move(func));
}

void MessageQueueThread::quitSynchronous() {
    // TODO!
}
