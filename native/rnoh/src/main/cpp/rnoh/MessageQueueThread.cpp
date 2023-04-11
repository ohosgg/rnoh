#include "RNOH/MessageQueueThread.h"

RNOHMessageQueueThread::RNOHMessageQueueThread(std::shared_ptr<rnoh::TaskExecutor> const &taskExecutor) 
    : taskExecutor(taskExecutor) {}

RNOHMessageQueueThread::~RNOHMessageQueueThread() {};

void RNOHMessageQueueThread::runOnQueue(std::function<void()> &&func) {
    taskExecutor->runTask(rnoh::TaskThread::JS, std::move(func));
}

void RNOHMessageQueueThread::runOnQueueSync(std::function<void()> &&func) {
    taskExecutor->runSyncTask(rnoh::TaskThread::JS, std::move(func));
}

void RNOHMessageQueueThread::quitSynchronous() {
    // TODO!
}
