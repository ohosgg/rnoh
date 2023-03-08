#include "RNOHMessageQueueThread.h"
#include "RNOHInstance.h"


void RNOHInstance::run() {
    this->initialize();
    this->runApplication();
}

void RNOHInstance::initialize() {
    std::vector<std::unique_ptr<facebook::react::NativeModule>> modules;
    this->instance->initializeBridge(
                std::make_unique<facebook::react::InstanceCallback>(),
                nullptr,
                std::make_shared<RNOHMessageQueueThread>(),
                std::make_shared<facebook::react::ModuleRegistry>(modules));
}

void RNOHInstance::runApplication() {
    auto runAppArgs = folly::dynamic::array();
    this->instance->callJSFunction("AppRegistry", "runApplication", std::forward<folly::dynamic>(runAppArgs));
    this->onComponentDescriptorTreeChanged(100);
}

