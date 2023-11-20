#include <atomic>
#include <exception>
#include <glog/logging.h>
#include "ThreadTaskRunner.h"

namespace rnoh {

ThreadTaskRunner::ThreadTaskRunner(std::string name) : name(name) {
    thread = std::thread([this] { runLoop(); });
    auto handle = thread.native_handle();
    pthread_setname_np(handle, name.c_str());
}

ThreadTaskRunner::~ThreadTaskRunner() {
    LOG(INFO) << "Shutting down thread runner " << name;
    running = false;
    cv.notify_all();
    thread.join();
}

void ThreadTaskRunner::runAsyncTask(Task &&task) {
    {
        std::unique_lock<std::mutex> lock(mutex);
        asyncTaskQueue.emplace(std::move(task));
    }
    // NOTE: this should be fine:
    // the only threads waiting on the condition variable are the
    // runner thread and the thread that called runSyncTask,
    // and if some thread is waiting in runSyncTask,
    // the runner thread should be running and executing its task
    if (std::this_thread::get_id() != thread.get_id()) {
        cv.notify_one();
    }
}

void ThreadTaskRunner::runSyncTask(Task &&task) {
    if (isOnCurrentThread()) {
        task();
        return;
    }
    std::unique_lock<std::mutex> lock(mutex);
    std::atomic_bool done{false};
    syncTaskQueue.emplace([task = std::move(task), &done] {
        task();
        done = true;
    });
    cv.notify_one();
    cv.wait(lock, [this, &done] { return done.load(); });
}

bool ThreadTaskRunner::isOnCurrentThread() const {
    return std::this_thread::get_id() == thread.get_id();
}

void ThreadTaskRunner::runLoop() {
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
            // notify the threads that called runSyncTask.
            // it's not enough to notify one thread,
            // because there could be multiple threads calling runSyncTask
            // at the same time
            cv.notify_all();
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
                try {
                    std::rethrow_if_nested(e);
                } catch (const std::exception &nested) {
                    LOG(ERROR) << nested.what();
                }
            }
        }
    }
}

} // namespace rnoh
