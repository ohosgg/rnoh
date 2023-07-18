#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include "RNOH/MessageQueueThread.h"
#include "RNOH/RNInstance.h"
#include "RNOH/EventBeat.h"
#include "hermes/executor/HermesExecutorFactory.h"
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include "RNOH/EventEmitterRegistry.h"
#include "RNOH/TurboModuleProvider.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNInstance.h"

using namespace facebook;
using namespace rnoh;

void RNInstance::registerSurface(
    RNInstance::MutationsListener mutationsListener,
    MountingManager::CommandDispatcher commandDispatcher) {
    this->mutationsListener = mutationsListener;
    this->commandDispatcher = commandDispatcher;
}

void RNInstance::start() {
    this->initialize();
    this->initializeScheduler();
}

void RNInstance::initialize() {
    std::vector<std::unique_ptr<react::NativeModule>> modules;
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

    std::make_shared<TurboModuleProvider>(
        this->instance->getJSCallInvoker(), 
        std::move(m_turboModuleFactory), [this] (auto turboModule) {
            if (auto eventHandler = std::dynamic_pointer_cast<EventEmitRequestHandler>(turboModule); eventHandler != nullptr) {
                this->m_eventEmitRequestHandlers.push_back(eventHandler);
            }
        }
        )->installJSBindings(this->instance->getRuntimeExecutor());
}

void RNInstance::initializeScheduler() {
    auto reactConfig = std::make_shared<react::EmptyReactNativeConfig>();
    m_contextContainer->insert("ReactNativeConfig", std::move(reactConfig));

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
        .contextContainer = m_contextContainer,
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
            this->mutationsListener(this->m_mutationsToNapiConverter, mutations);
        },
        [this](auto tag, auto commandName, auto args) {
            this->taskExecutor->runTask(TaskThread::MAIN, [this, tag, commandName = std::move(commandName), args = std::move(args)]() {
                this->commandDispatcher(tag, commandName, args);
            });
        }));
    this->scheduler = std::make_unique<react::Scheduler>(schedulerToolbox, nullptr, schedulerDelegate.get());
}

void RNInstance::loadScriptFromString(std::string const &&bundle, std::string const sourceURL) {
    this->taskExecutor->runTask(TaskThread::JS, [this, bundle = std::move(bundle), sourceURL]() {
        std::unique_ptr<react::JSBigStdString> jsBundle;
        jsBundle = std::make_unique<react::JSBigStdString>(std::move(bundle));
        this->instance->loadScriptFromString(std::move(jsBundle), sourceURL, true);
    });
}

void RNInstance::runApplication(float width, float height, std::string const &moduleName, folly::dynamic &&initialProps) {
    this->taskExecutor->runTask(TaskThread::JS, [this, width, height, moduleName, initialProps = std::move(initialProps)]() {
        try {
            auto surfaceHandler = std::make_shared<facebook::react::SurfaceHandler>(moduleName, 1);
            surfaceHandler->setProps(std::move(initialProps));
            auto layoutConstraints = surfaceHandler->getLayoutConstraints();
            layoutConstraints.layoutDirection = react::LayoutDirection::LeftToRight;
            layoutConstraints.minimumSize = layoutConstraints.maximumSize = {
                .width = width,
                .height = height};
            surfaceHandler->constraintLayout(layoutConstraints, surfaceHandler->getLayoutContext());
            scheduler->registerSurface(*surfaceHandler);
            surfaceHandler->start();
            surfaceHandlers[moduleName] = surfaceHandler;
        } catch (const std::exception &e) {
            LOG(ERROR) << "runApplication: " << e.what() << "\n";
            throw e;
        };
    });
}
void RNInstance::updateSurfaceConstraints(std::string const &moduleName, float width, float height) {
    this->taskExecutor->runTask(TaskThread::JS, [this, width, height, moduleName]() {
        try {
            auto layoutConstraints = surfaceHandlers[moduleName]->getLayoutConstraints();
            layoutConstraints.minimumSize = layoutConstraints.maximumSize = {
                .width = width,
                .height = height};
            surfaceHandlers[moduleName]->constraintLayout(layoutConstraints, surfaceHandlers[moduleName]->getLayoutContext());
        } catch (const std::exception &e) {
            LOG(ERROR) << "updateSurfaceConstraints: " << e.what() << "\n";
            throw e;
        };
    });
}

void rnoh::RNInstance::emitComponentEvent(napi_env env, react::Tag tag, std::string eventName, napi_value payload) {
    EventEmitRequestHandler::Context ctx{
        .env = env,
        .tag = tag,
        .eventName = std::move(eventName),
        .payload = payload,
        .eventEmitterRegistry = this->eventEmitterRegistry,
    };
    
    for (auto &eventEmitRequestHandler : m_eventEmitRequestHandlers) {
        eventEmitRequestHandler->handleEvent(ctx);
    }
}

void RNInstance::callFunction(std::string &&module, std::string &&method, folly::dynamic &&params) {
    this->taskExecutor->runTask(TaskThread::JS, [this, module = std::move(module), method = std::move(method), params = std::move(params)]() mutable {
        this->instance->callJSFunction(std::move(module), std::move(method), std::move(params));
    });
}
