#include "RNOHMessageQueueThread.h"

void RNOHMessageQueueThread::runOnQueue(std::function<void()> && task) {
    // TODO: run on separate thread
    task();
}

void RNOHMessageQueueThread::runOnQueueSync(std::function<void()> && task) {
    // TODO: run on separate thread
    task();
};

void RNOHMessageQueueThread::quitSynchronous() {
    return;
};