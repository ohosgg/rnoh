#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include "RNOHMessageQueueThread.h"
#include "RNOHInstance.h"
#include "RNOHEventBeat.h"
#include "hermes/executor/HermesExecutorFactory.h"
using namespace facebook::react;

void RNOHInstance::start() {
    this->initialize();
    //    this->surfaceHandler.start();
    //    this->runApplication();
}

void RNOHInstance::initialize() {
    std::vector<std::unique_ptr<NativeModule>> modules;
    this->contextContainer = std::make_shared<facebook::react::ContextContainer>();
    this->taskExecutor = std::make_shared<RNOHTaskExecutor>();
    this->componentDescriptorProviderRegistry = std::make_shared<facebook::react::ComponentDescriptorProviderRegistry>();
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

void RNOHInstance::initializeScheduler() {
    facebook::react::EventBeat::Factory eventBeatFactory = [taskExecutor = this->taskExecutor, runtimeExecutor = this->instance->getRuntimeExecutor()](auto ownerBox) {
        return std::make_unique<RNOHEventBeat>(taskExecutor, runtimeExecutor, ownerBox);
    };

    facebook::react::ComponentRegistryFactory componentRegistryFactory =
        [registry = this->componentDescriptorProviderRegistry](
            auto eventDispatcher, auto contextContainer) {
            return registry->createComponentDescriptorRegistry(
                {eventDispatcher, contextContainer});
        };

    auto backgroundExecutor = [executor = this->taskExecutor](std::function<void()> &&callback) {
        executor->runOnQueue(std::move(callback));
    };

    facebook::react::SchedulerToolbox schedulerToolbox{
        .contextContainer = this->contextContainer,
        .componentRegistryFactory = componentRegistryFactory,
        .runtimeExecutor = this->instance->getRuntimeExecutor(),
        .asynchronousEventBeatFactory = eventBeatFactory,
        .synchronousEventBeatFactory = eventBeatFactory,
        .backgroundExecutor = backgroundExecutor,
    };

    this->schedulerDelegate = std::make_unique<RNOHSchedulerDelegate>();
    this->scheduler = std::make_unique<facebook::react::Scheduler>(schedulerToolbox, nullptr, schedulerDelegate.get());
}

void RNOHInstance::runApplication() {
    auto runAppArgs = folly::dynamic::array();
    this->instance->callJSFunction("AppRegistry", "runApplication", std::forward<folly::dynamic>(runAppArgs));
}

void RNOHInstance::simulateComponentDescriptorTreeUpdate() {
    this->onComponentDescriptorTreeChanged(100);
}
