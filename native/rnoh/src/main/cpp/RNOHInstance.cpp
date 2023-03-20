#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include "RNOHMessageQueueThread.h"
#include "RNOHInstance.h"
#include "RNOHEventBeat.h"
#include "RNOHLogSink.h"
#include "hermes/executor/HermesExecutorFactory.h"
#include "jsbundle.h"

using namespace facebook::react;

void RNOHInstance::start() {
    RNOHLogSink::initializeLogging();

    this->initialize();
    this->initializeScheduler();

    auto layoutConstraints = this->surfaceHandler.getLayoutConstraints();
    layoutConstraints.layoutDirection = LayoutDirection::LeftToRight;
    this->surfaceHandler.constraintLayout(layoutConstraints, surfaceHandler.getLayoutContext());
    this->scheduler->registerSurface(this->surfaceHandler);
    //    this->runApplication();
}

void RNOHInstance::initialize() {
    std::vector<std::unique_ptr<NativeModule>> modules;
    this->contextContainer = std::make_shared<facebook::react::ContextContainer>();
    this->taskExecutor = std::make_shared<rnoh::TaskExecutor>(env);
    this->componentDescriptorProviderRegistry = std::make_shared<facebook::react::ComponentDescriptorProviderRegistry>();
    auto instanceCallback = std::make_unique<facebook::react::InstanceCallback>();
    auto jsExecutorFactory = std::make_shared<facebook::react::HermesExecutorFactory>(
        // runtime installer, which is run when the runtime
        // is first initialized and provides access to the runtime
        // before the JS code is executed
        [](facebook::jsi::Runtime &rt) {
            return;
        });
    auto jsQueue = std::make_shared<RNOHMessageQueueThread>(this->taskExecutor);
    auto moduleRegistry = std::make_shared<facebook::react::ModuleRegistry>(std::move(modules));
    this->instance->initializeBridge(
        std::move(instanceCallback),
        std::move(jsExecutorFactory),
        std::move(jsQueue),
        std::move(moduleRegistry));
}

void RNOHInstance::initializeScheduler() {
    auto reactConfig = std::make_shared<react::EmptyReactNativeConfig>();
    this->contextContainer->insert("ReactNativeConfig", std::move(reactConfig));

    facebook::react::EventBeat::Factory eventBeatFactory = [taskExecutor = std::weak_ptr(taskExecutor), runtimeExecutor = this->instance->getRuntimeExecutor()](auto ownerBox) {
        return std::make_unique<RNOHEventBeat>(taskExecutor, runtimeExecutor, ownerBox);
    };

    facebook::react::ComponentRegistryFactory componentRegistryFactory =
        [registry = this->componentDescriptorProviderRegistry](
            auto eventDispatcher, auto contextContainer) {
            return registry->createComponentDescriptorRegistry(
                {eventDispatcher, contextContainer});
        };

    auto backgroundExecutor = [executor = this->taskExecutor](std::function<void()> &&callback) {
        executor->runTask(rnoh::TaskThread::BACKGROUND, std::move(callback));
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
    folly::dynamic config = folly::dynamic::object("rootTag", 1)("fabric", true);
    auto args = folly::dynamic::array();
    auto unique_js_bundle = std::make_unique<facebook::react::JSBigStdString>(JS_BUNDLE);
    try {
        this->instance->loadScriptFromString(std::move(unique_js_bundle), "jsBundle.js", true);
        args.push_back("rnempty");
        args.push_back(std::move(config));
        this->surfaceHandler.start();
        // this->instance->callJSFunction("AppRegistry", "runApplication", std::move(args));
    } catch (const std::exception &e) {
        LOG(ERROR) << "runApplication: " << e.what() << "\n";
        return;
    }

}

void RNOHInstance::simulateComponentDescriptorTreeUpdate() {
    this->onComponentDescriptorTreeChanged(100);
}
