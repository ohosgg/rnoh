#ifndef native_RNOHMessageQueueThread_H
#define native_RNOHMessageQueueThread_H
#include <cxxreact/MessageQueueThread.h>

class RNOHMessageQueueThread : public facebook::react::MessageQueueThread {
    void runOnQueue(std::function<void()> && task) override;
    void runOnQueueSync(std::function<void()> && task) override;
    void quitSynchronous() override;
};

#endif //native_RNOHMessageQueueThread_H
