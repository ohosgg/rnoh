#include "RNOHMessageQueueThread.h"

RNOHMessageQueueThread::RNOHMessageQueueThread() : m_isDying(false), m_isDead(false) {
    m_thread = std::thread([this] { this->run(); });
}

RNOHMessageQueueThread::~RNOHMessageQueueThread() {
    quitSynchronous();
}

void RNOHMessageQueueThread::runOnQueue(std::function<void()> &&func) {
    {
        std::lock_guard<std::mutex> lock(m_mtx);
        m_asyncTaskQueue.emplace(std::move(func));
    }
    m_cv.notify_one();
}

void RNOHMessageQueueThread::runOnQueueSync(std::function<void()> &&func) {
    std::unique_lock<std::mutex> lock(m_mtx);
    m_syncTaskQueue.emplace(std::move(func));
    m_cv.notify_one();
    m_cv.wait(lock, [this] { return m_syncTaskQueue.empty(); });
}

void RNOHMessageQueueThread::quitSynchronous() {
    std::unique_lock<std::mutex> lock(m_mtx);
    if (m_isDead)
        return;
    m_isDying = true;
    m_cv.notify_one();
    m_quitCv.wait(lock, [this] { return m_isDead; });
    if (m_thread.joinable()) {
        m_thread.join();
    }
}

void RNOHMessageQueueThread::run() {
    while (true) {
        std::unique_lock<std::mutex> lock(m_mtx);
        m_cv.wait(lock, [this] { return !m_asyncTaskQueue.empty() || !m_syncTaskQueue.empty() || m_isDying; });
        if (m_isDying) {
            m_isDying = false;
            m_isDead = true;
            m_quitCv.notify_one();
            return;
        }
        if (!m_syncTaskQueue.empty()) {
            auto func = std::move(m_syncTaskQueue.front());
            m_syncTaskQueue.pop();
            lock.unlock();
            func();
            m_cv.notify_one();
            continue;
        }
        if (!m_asyncTaskQueue.empty()) {
            auto func = std::move(m_asyncTaskQueue.front());
            m_asyncTaskQueue.pop();
            lock.unlock();
            func();
        }
    }
}
