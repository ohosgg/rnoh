#include "RNOHMessageQueueThread.h"
#include <memory>
#include <cxxreact/Instance.h>
#include <cxxreact/ModuleRegistry.h>
#include <cxxreact/NativeModule.h>
#include <folly/dynamic.h>
#include <utility>
#include <thread>


class RNOHInstance {
    RNOHInstance() 
        instance(std::make_shared<facebook::react::Instance>())
    {}
    
    public:
    void run() {
        this->initialize();
        this->runApplication();
    }
    private:
    std::shared_ptr<facebook::react::Instance> instance;
    
    void initialize() {
        std::vector<std::unique_ptr<facebook::react::NativeModule>> modules;
        this->instance->initializeBridge(
                    std::make_unique<facebook::react::InstanceCallback>(),
                    nullptr,
                    std::make_shared<RNOHMessageQueueThread>(),
                    std::make_shared<facebook::react::ModuleRegistry>(modules));
    }

    void runApplication() {
        auto runAppArgs = folly::dynamic::array();
        this->instance->callJSFunction("AppRegistry", "runApplication", std::forward<folly::dynamic>(runAppArgs));
    }
};
