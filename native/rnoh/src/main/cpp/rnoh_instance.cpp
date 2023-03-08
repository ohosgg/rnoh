#include "RNOHMessageQueueThread.h"
#include <memory>
#include <cxxreact/Instance.h>
#include <folly/dynamic.h>
#include <utility>
#include <thread>


class RNOHInstance {
    RNOHInstance() {
        this->instance = std::make_shared<facebook::react::Instance>();
    }
    
  public:
    void run() {
        this->initialize();
        this->run_application();
    }
  
    private:
    std::shared_ptr<facebook::react::Instance> instance;
    
    void initialize() {
        
        this->instance->initializeBridge(
                    std::make_unique<facebook::react::InstanceCallback>(),
                    nullptr,
                    std::make_shared<RNOHMessageQueueThread>(),
                    nullptr);
    }

    void run_application() {
        auto runAppArgs = folly::dynamic::array();
        this->instance->callJSFunction("AppRegistry", "runApplication", std::forward<folly::dynamic>(runAppArgs));
    }
};
