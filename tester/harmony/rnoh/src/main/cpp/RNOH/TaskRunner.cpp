#include <exception>
#include <glog/logging.h>
#include "RNOH/TaskRunner.h"

namespace rnoh {

TaskRunner::TaskRunner(std::string name) : name(name) {
    thread = std::thread([this] { runLoop(); });
}

TaskRunner::~TaskRunner() {
    LOG(INFO) << "Shutting down thread runner " << name;
    running = false;
    cv.notify_one();
    thread.join();
}

void TaskRunner::runAsyncTask(Task &&task) {
    {
        std::unique_lock<std::mutex> lock(mutex);
        asyncTaskQueue.emplace(std::move(task));
    }
    cv.notify_one();
}

void TaskRunner::runSyncTask(Task &&task) {
    std::unique_lock<std::mutex> lock(mutex);
    syncTaskQueue.emplace(std::move(task));
    cv.notify_one();
    cv.wait(lock, [this] { return syncTaskQueue.empty(); });
}

void TaskRunner::runLoop() {
    while (running) {
        std::unique_lock<std::mutex> lock(mutex);
        cv.wait(lock, [this] { return hasPendingTasks() || !running; });
        if (!running) {
            return;
        }
        if (!syncTaskQueue.empty()) {
            auto task = std::move(syncTaskQueue.front());
            syncTaskQueue.pop();
            lock.unlock();
            try {
                task();
            } catch (std::exception const &e) {
                LOG(ERROR) << "Exception thrown in sync task";
                LOG(ERROR) << e.what();
            }
            cv.notify_one();
            continue;
        }
        if (!asyncTaskQueue.empty()) {
            auto task = std::move(asyncTaskQueue.front());
            asyncTaskQueue.pop();
            lock.unlock();
            try {
                task();
            } catch (std::exception const &e) {
                LOG(ERROR) << "Exception thrown in task";
                LOG(ERROR) << e.what();
            }
        }
    }
}

}
