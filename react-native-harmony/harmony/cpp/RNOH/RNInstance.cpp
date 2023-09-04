#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include "RNOH/MessageQueueThread.h"
#include "RNOH/RNInstance.h"
#include "RNOH/EventBeat.h"
#include "hermes/executor/HermesExecutorFactory.h"
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TurboModuleProvider.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNInstance.h"

using namespace facebook;
using namespace rnoh;

void RNInstance::registerSurface(
    RNInstance::MutationsListener &&mutationsListener,
    MountingManager::CommandDispatcher &&commandDispatcher) {
    this->mutationsListener = std::move(mutationsListener);
    this->commandDispatcher = std::move(commandDispatcher);
}

void RNInstance::start() {
    this->initialize();
    this->initializeScheduler();
}

void RNInstance::initialize() {
    // create a new event dispatcher every time RN is initialized
    m_eventDispatcher = std::make_shared<EventDispatcher>();
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
        std::move(m_turboModuleFactory),
        m_eventDispatcher)
        ->installJSBindings(this->instance->getRuntimeExecutor());
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
        shadowViewRegistry,
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

void RNInstance::startSurface(float width, float height, float viewportOffsetX, float viewportOffsetY, std::string const &moduleName, folly::dynamic &&initialProps) {
    this->taskExecutor->runTask(TaskThread::JS, [this, width, height, viewportOffsetX, viewportOffsetY, moduleName, initialProps = std::move(initialProps)]() {
        try {
            auto surfaceHandler = std::make_shared<facebook::react::SurfaceHandler>(moduleName, 1);
            surfaceHandler->setProps(std::move(initialProps));
            auto layoutConstraints = surfaceHandler->getLayoutConstraints();
            layoutConstraints.layoutDirection = react::LayoutDirection::LeftToRight;
            layoutConstraints.minimumSize = layoutConstraints.maximumSize = {
                .width = width,
                .height = height};
            auto layoutContext = surfaceHandler->getLayoutContext();
            layoutContext.viewportOffset = {viewportOffsetX, viewportOffsetY};
            surfaceHandler->constraintLayout(layoutConstraints, layoutContext);
            scheduler->registerSurface(*surfaceHandler);
            surfaceHandler->start();
            surfaceHandlers[moduleName] = surfaceHandler;
        } catch (const std::exception &e) {
            LOG(ERROR) << "startSurface: " << e.what() << "\n";
            throw e;
        };
    });
}
void RNInstance::updateSurfaceConstraints(std::string const &moduleName, float width, float height, float viewportOffsetX, float viewportOffsetY) {
    this->taskExecutor->runTask(TaskThread::JS, [this, width, height, viewportOffsetX, viewportOffsetY, moduleName]() {
        try {
            if (surfaceHandlers[moduleName] == nullptr) {
                return;
            }
            auto layoutConstraints = surfaceHandlers[moduleName]->getLayoutConstraints();
            layoutConstraints.minimumSize = layoutConstraints.maximumSize = {
                .width = width,
                .height = height};
            auto layoutContext = surfaceHandlers[moduleName]->getLayoutContext();
            layoutContext.viewportOffset = {viewportOffsetX, viewportOffsetY};
            surfaceHandlers[moduleName]->constraintLayout(layoutConstraints, layoutContext);
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
        .shadowViewRegistry = this->shadowViewRegistry,
    };

    if (m_eventDispatcher != nullptr) {
        m_eventDispatcher->sendEvent(ctx);
    }

    for (auto &eventEmitRequestHandler : m_eventEmitRequestHandlers) {
        eventEmitRequestHandler->handleEvent(ctx);
    }
}

void rnoh::RNInstance::onMemoryLevel(size_t memoryLevel) {
    // Android memory levels are 5, 10, 15, while Ark's are 0, 1, 2
    static const int memoryLevels[] = {5, 10, 15};
    if (this->instance) {
        this->instance->handleMemoryPressure(memoryLevels[memoryLevel]);
    }
}

void rnoh::RNInstance::updateState(napi_env env, std::string const &componentName, facebook::react::Tag tag, napi_value newState) {
    if (auto state = shadowViewRegistry->getFabricState<facebook::react::State>(tag)) {
        m_mutationsToNapiConverter.updateState(env, componentName, state, newState);
    }
}

void RNInstance::callFunction(std::string &&module, std::string &&method, folly::dynamic &&params) {
    this->taskExecutor->runTask(TaskThread::JS, [this, module = std::move(module), method = std::move(method), params = std::move(params)]() mutable {
        this->instance->callJSFunction(std::move(module), std::move(method), std::move(params));
    });
}
