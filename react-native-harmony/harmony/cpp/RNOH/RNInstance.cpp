#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include "RNOH/MessageQueueThread.h"
#include "RNOH/RNInstance.h"
#include "RNOH/EventBeat.h"
#include "RNOH/LogSink.h"
#include "hermes/executor/HermesExecutorFactory.h"
#include "jsbundle.h"
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include "RNOH/events/EventEmitterRegistry.h"
#include "RNOH/TurboModuleProvider.h"
#include "RNOH/TurboModuleFactory.h"

using namespace facebook;
using namespace rnoh;

void RNInstance::registerSurface(
    RNInstance::MutationsListener mutationsListener,
    MountingManager::CommandDispatcher commandDispatcher) {
    this->mutationsListener = mutationsListener;
    this->commandDispatcher = commandDispatcher;
}

void RNInstance::start() {
    LogSink::initializeLogging();
    this->initialize();
    this->initializeScheduler();
}

void RNInstance::initialize() {
    std::vector<std::unique_ptr<react::NativeModule>> modules;
    this->contextContainer = std::make_shared<react::ContextContainer>();
    auto instanceCallback = std::make_unique<react::InstanceCallback>();
    auto jsExecutorFactory = std::make_shared<react::HermesExecutorFactory>(
        // runtime installer, which is run when the runtime
        // is first initialized and provides access to the runtime
        // before the JS code is executed
        [](facebook::jsi::Runtime &rt) {
            return;
        });
    auto jsQueue = std::make_shared<MessageQueueThread>(this->taskExecutor);
    auto moduleRegistry = std::make_shared<react::ModuleRegistry>(std::move(modules));
    this->instance->initializeBridge(
        std::move(instanceCallback),
        std::move(jsExecutorFactory),
        std::move(jsQueue),
        std::move(moduleRegistry));

    std::make_shared<TurboModuleProvider>(this->instance->getJSCallInvoker(), std::move(m_turboModuleFactory))
        ->installJSBindings(this->instance->getRuntimeExecutor());
}

void RNInstance::initializeScheduler() {
    auto reactConfig = std::make_shared<react::EmptyReactNativeConfig>();
    this->contextContainer->insert("ReactNativeConfig", std::move(reactConfig));

    react::EventBeat::Factory eventBeatFactory = [taskExecutor = std::weak_ptr(taskExecutor), runtimeExecutor = this->instance->getRuntimeExecutor()](auto ownerBox) {
        return std::make_unique<EventBeat>(taskExecutor, runtimeExecutor, ownerBox);
    };

    react::ComponentRegistryFactory componentRegistryFactory =
        [registry = m_componentDescriptorProviderRegistry](
            auto eventDispatcher, auto contextContainer) {
            return registry->createComponentDescriptorRegistry(
                {eventDispatcher, contextContainer});
        };

    auto backgroundExecutor = [executor = this->taskExecutor](std::function<void()> &&callback) {
        executor->runTask(TaskThread::BACKGROUND, std::move(callback));
    };

    react::SchedulerToolbox schedulerToolbox{
        .contextContainer = this->contextContainer,
        .componentRegistryFactory = componentRegistryFactory,
        .runtimeExecutor = this->instance->getRuntimeExecutor(),
        .asynchronousEventBeatFactory = eventBeatFactory,
        .synchronousEventBeatFactory = eventBeatFactory,
        .backgroundExecutor = backgroundExecutor,
    };

    this->schedulerDelegate = std::make_unique<SchedulerDelegate>(MountingManager(
        taskExecutor,
        eventEmitterRegistry,
        [this](react::ShadowViewMutationList mutations) {
            LOG(INFO) << "Triggering ui update";
            this->mutationsListener(this->m_mutationsToNapiConverter, mutations);
        },
        [this](auto tag, auto commandName, auto args) {
            this->taskExecutor->runTask(TaskThread::MAIN, [this, tag, commandName = std::move(commandName), args = std::move(args)]() {
                this->commandDispatcher(tag, commandName, args);
            });
        }));
    this->scheduler = std::make_unique<react::Scheduler>(schedulerToolbox, nullptr, schedulerDelegate.get());
}

void RNInstance::runApplication(float width, float height, std::string &&bundle) {
    this->taskExecutor->runTask(TaskThread::JS, [this, width, height, bundle = std::move(bundle)]() {
        try {
            std::unique_ptr<react::JSBigStdString> jsBundle;
            if (bundle.length() == 0) {
                jsBundle = std::make_unique<react::JSBigStdString>(JS_BUNDLE);
            } else {
                jsBundle = std::make_unique<react::JSBigStdString>(std::move(bundle));
            }
            instance->loadScriptFromString(std::move(jsBundle), "bundle.harmony.js", true);
            folly::dynamic config = folly::dynamic::object("rootTag", 1)("fabric", true);
            this->surfaceHandler.setProps(std::move(config));
            auto layoutConstraints = this->surfaceHandler.getLayoutConstraints();
            layoutConstraints.layoutDirection = react::LayoutDirection::LeftToRight;
            layoutConstraints.minimumSize = layoutConstraints.maximumSize = {
                .width = width,
                .height = height};
            this->surfaceHandler.constraintLayout(layoutConstraints, this->surfaceHandler.getLayoutContext());
            this->scheduler->registerSurface(this->surfaceHandler);
            this->surfaceHandler.start();
        } catch (const std::exception &e) {
            LOG(ERROR) << "runApplication: " << e.what() << "\n";
            throw e;
        };
    });
}

void RNInstance::emitEvent(react::Tag tag, ReactEventKind eventKind, napi_value eventObject) {
    this->eventEmitterHelper.emitEvent(tag, eventKind, eventObject);
}

void RNInstance::callFunction(std::string &&module, std::string &&method, folly::dynamic &&params) {
    this->taskExecutor->runTask(TaskThread::JS, [this, module = std::move(module), method = std::move(method), params = std::move(params)]() mutable {
        this->instance->callJSFunction(std::move(module), std::move(method), std::move(params));
    });
}
