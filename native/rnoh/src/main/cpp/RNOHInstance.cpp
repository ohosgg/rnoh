#include "RNOHMessageQueueThread.h"
#include "RNOHInstance.h"
#include "hermes/executor/HermesExecutorFactory.h"

void RNOHInstance::start() {
    this->initialize();
//    this->surfaceHandler.start();
//    this->runApplication();
}

void RNOHInstance::initialize() {
    std::vector<std::unique_ptr<facebook::react::NativeModule>> modules;
    auto instanceCallback = std::make_unique<facebook::react::InstanceCallback>();
    auto jsExecutorFactory = std::make_shared<facebook::react::HermesExecutorFactory>(
        // runtime installer, which is run when the runtime
        // is first initialized and provides access to the runtime
        // before the JS code is executed
        [](facebook::jsi::Runtime &rt) {
            return;
        });
    auto jsQueue = std::make_shared<RNOHMessageQueueThread>();
    auto moduleRegistry = std::make_shared<facebook::react::ModuleRegistry>(std::move(modules));
    this->instance->initializeBridge(
        std::move(instanceCallback),
        std::move(jsExecutorFactory),
        std::move(jsQueue),
        std::move(moduleRegistry));
}

void RNOHInstance::runApplication() {
    auto runAppArgs = folly::dynamic::array();
    this->instance->callJSFunction("AppRegistry", "runApplication", std::forward<folly::dynamic>(runAppArgs));
}

void RNOHInstance::simulateComponentDescriptorTreeUpdate() {
    this->onComponentDescriptorTreeChanged(100);
}
