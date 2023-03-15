#ifndef native_RNOHMessageQueueThread_H
#define native_RNOHMessageQueueThread_H
#include <cxxreact/MessageQueueThread.h>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>

class RNOHMessageQueueThread : public facebook::react::MessageQueueThread {
  public:
    RNOHMessageQueueThread();
    virtual ~RNOHMessageQueueThread();

    void runOnQueue(std::function<void()> &&func) override;

    void runOnQueueSync(std::function<void()> &&func) override;

    void quitSynchronous() override;

  private:
    void run();

    std::thread m_thread;
    std::queue<std::function<void()>> m_asyncTaskQueue;
    std::queue<std::function<void()>> m_syncTaskQueue;
    std::mutex m_mtx;
    std::condition_variable m_cv;
    std::condition_variable m_quitCv;
    bool m_isDying;
    bool m_isDead;
};

typedef RNOHMessageQueueThread RNOHTaskExecutor;

#endif //native_RNOHMessageQueueThread_H
