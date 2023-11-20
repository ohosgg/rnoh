#pragma once

#include <functional>

class AbstractTaskRunner {
public:
    using Task = std::function<void()>;

    virtual void runAsyncTask(Task &&task) = 0;
    virtual void runSyncTask(Task &&task) = 0;

    virtual bool isOnCurrentThread() const = 0;

    virtual ~AbstractTaskRunner() = default;
};
