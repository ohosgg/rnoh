#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include <react/renderer/animations/LayoutAnimationDriver.h>
#include <cxxreact/JSBundleType.h>
#include "RNOH/MessageQueueThread.h"
#include "RNOH/RNInstance.h"
#include "RNOH/EventBeat.h"
#include "hermes/executor/HermesExecutorFactory.h"
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include <jsireact/JSIExecutor.h>
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TurboModuleProvider.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNInstance.h"
#include "NativeLogger.h"

using namespace facebook;
using namespace rnoh;

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
            // install `console.log` (etc.) implementation
            react::bindNativeLogger(rt, nativeLogger);
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
                                                                      m_shadowViewRegistry,
                                                                      [this](auto &preallocatedViewRawPropsByTag, react::ShadowViewMutationList mutations) {
                                                                          this->m_mutationsListener(this->m_mutationsToNapiConverter, preallocatedViewRawPropsByTag, mutations);
                                                                      },
                                                                      [this](auto tag, auto commandName, auto args) {
                                                                          this->taskExecutor->runTask(TaskThread::MAIN, [this, tag, commandName = std::move(commandName), args = std::move(args)]() {
                                                                              this->m_commandDispatcher(tag, commandName, args);
                                                                          });
                                                                      }),
                                                                  m_arkTsChannel);
    m_animationDriver = std::make_shared<react::LayoutAnimationDriver>(
        this->instance->getRuntimeExecutor(), m_contextContainer, this);
    this->scheduler = std::make_unique<react::Scheduler>(schedulerToolbox, m_animationDriver.get(), schedulerDelegate.get());
}

void RNInstance::loadScript(std::vector<uint8_t> &&bundle, std::string const sourceURL, std::function<void(const std::string)> &&onFinish) {
    this->taskExecutor->runTask(TaskThread::JS, [this, bundle = std::move(bundle), sourceURL, onFinish = std::move(onFinish)]() mutable {
        std::unique_ptr<react::JSBigBufferString> jsBundle;
        jsBundle = std::make_unique<react::JSBigBufferString>(bundle.size());
        memcpy(jsBundle->data(), bundle.data(), bundle.size());

        react::BundleHeader header;
        memcpy(&header, bundle.data(), sizeof(react::BundleHeader));
        react::ScriptTag scriptTag = react::parseTypeFromHeader(header);
        // NOTE: Hermes bytecode bundles are treated as String bundles,
        // and don't throw an error here.
        if (scriptTag != react::ScriptTag::String) {
            throw new std::runtime_error("RAM bundles are not yet supported");
        }
        try {
            this->instance->loadScriptFromString(std::move(jsBundle), sourceURL, true);
            onFinish("");
        } catch (std::exception const &e) {
            try {
                std::rethrow_if_nested(e);
                onFinish(e.what());
            } catch (const std::exception &nested) {
                onFinish(e.what() + std::string("\n") + nested.what());
            }
        }
    });
}

void rnoh::RNInstance::createSurface(react::Tag surfaceId, std::string const &appKey) {
    if (surfaceHandlers.count(surfaceId)) {
        LOG(ERROR) << "createSurface: Surface with surface id " << surfaceId << " already exists.";
        return;
    }
    auto surfaceHandler = std::make_shared<react::SurfaceHandler>(appKey, surfaceId);
    this->taskExecutor->runTask(TaskThread::MAIN, [surfaceHandler, this]() {
        this->scheduler->registerSurface(*surfaceHandler);
    });
    surfaceHandlers.insert({surfaceId, std::move(surfaceHandler)});
}

void RNInstance::startSurface(react::Tag surfaceId,
                              float width,
                              float height,
                              float viewportOffsetX,
                              float viewportOffsetY,
                              float pixelRatio,
                              folly::dynamic &&initialProps,
                              std::function<void()> &&onFinish) {
    try {
        this->taskExecutor->runTask(TaskThread::MAIN, [=]() {
            auto it = surfaceHandlers.find(surfaceId);
            if (it == surfaceHandlers.end()) {
                LOG(ERROR) << "startSurface: No surface with id " << surfaceId;
                return;
            }

            auto surfaceHandler = it->second;
            surfaceHandler->setProps(std::move(initialProps));
            auto layoutConstraints = surfaceHandler->getLayoutConstraints();
            layoutConstraints.layoutDirection = react::LayoutDirection::LeftToRight;
            layoutConstraints.minimumSize = layoutConstraints.maximumSize = {
                .width = width,
                .height = height};
            auto layoutContext = surfaceHandler->getLayoutContext();
            surfaceHandler->setDisplayMode(react::DisplayMode::Suspended);
            layoutContext.viewportOffset = {viewportOffsetX, viewportOffsetY};
            layoutContext.pointScaleFactor = pixelRatio;
            surfaceHandler->constraintLayout(layoutConstraints, layoutContext);
            LOG(INFO) << "startSurface::starting: surfaceId=" << surfaceId;
            /**
             * Running on BACKGROUND thread prevents deadlock when text is measured on the main thread.
             * It should be safe to remove once we text measurement is moved on the background thread.
             */
            this->taskExecutor->runTask(TaskThread::BACKGROUND, [this, surfaceHandler, surfaceId, onFinish]() {
                surfaceHandler->start();
                LOG(INFO) << "startSurface::started surfaceId=" << surfaceId;
                this->taskExecutor->runTask(TaskThread::MAIN, [this, surfaceHandler, onFinish]() {
                    auto mountingCoordinator = surfaceHandler->getMountingCoordinator();
                    mountingCoordinator->setMountingOverrideDelegate(m_animationDriver);
                    onFinish();
                });
            });
        });
    } catch (const std::exception &e) {
        LOG(ERROR) << "startSurface: " << e.what() << "\n";
        throw e;
    };
}

void rnoh::RNInstance::setSurfaceProps(facebook::react::Tag surfaceId, folly::dynamic &&props) {
    auto it = surfaceHandlers.find(surfaceId);
    if (it == surfaceHandlers.end()) {
        LOG(ERROR) << "setSurfaceProps: No surface with id " << surfaceId;
        return;
    }
    it->second->setProps(std::move(props));
}

void rnoh::RNInstance::stopSurface(react::Tag surfaceId, std::function<void()> &&onFinish) {
    auto it = surfaceHandlers.find(surfaceId);
    if (it == surfaceHandlers.end()) {
        LOG(ERROR) << "stopSurface: No surface with id " << surfaceId;
        return;
    }
    auto surfaceHandle = it->second;
    // stopping on main thread asynchronously caused dead lock
    this->taskExecutor->runTask(TaskThread::JS, [this, surfaceId, surfaceHandle, onFinish = std::move(onFinish)]() {
        LOG(INFO) << "stopSurface: stopping " << surfaceId;
        try {
            surfaceHandle->stop();
            LOG(INFO) << "stopSurface: stopped " << surfaceId;
            this->taskExecutor->runTask(TaskThread::MAIN, [onFinish = std::move(onFinish)]() {
                onFinish();
            });
        } catch (const std::exception &e) {
            LOG(ERROR) << "stopSurface: failed - " << e.what() << "\n";
            this->taskExecutor->runTask(TaskThread::MAIN, [onFinish = std::move(onFinish)]() {
                onFinish();
            });
            throw e;
        };
    });
}

void rnoh::RNInstance::destroySurface(react::Tag surfaceId, std::function<void()> &&onFinish) {
    this->taskExecutor->runTask(TaskThread::MAIN, [this, surfaceId, onFinish = std::move(onFinish)]() {
        auto it = surfaceHandlers.find(surfaceId);
        if (it == surfaceHandlers.end()) {
            LOG(ERROR) << "destroySurface: No surface with id " << surfaceId;
            return;
        }
        scheduler->unregisterSurface(*it->second);
        surfaceHandlers.erase(it);
        onFinish();
    });
}

void rnoh::RNInstance::setSurfaceDisplayMode(facebook::react::Tag surfaceId, facebook::react::DisplayMode displayMode) {
    try {
        auto surfaceIt = surfaceHandlers.find(surfaceId);
        if (surfaceIt == surfaceHandlers.end()) {
            LOG(ERROR) << "setSurfaceDisplayMode: No surface with id " << surfaceId;
            return;
        }
        auto surfaceHandler = surfaceIt->second;
        taskExecutor->runTask(TaskThread::JS, [this, surfaceHandler, displayMode]() {
            surfaceHandler->setDisplayMode(displayMode);
        });
    } catch (const std::exception &e) {
        LOG(ERROR) << "setSurfaceDisplayMode: " << e.what() << "\n";
        throw e;
    }
}

void RNInstance::updateSurfaceConstraints(react::Tag surfaceId, float width, float height, float viewportOffsetX, float viewportOffsetY, float pixelRatio) {
    try {
        if (surfaceHandlers.count(surfaceId) == 0) {
            LOG(ERROR) << "updateSurfaceConstraints: No surface with id " << surfaceId;
            return;
        }
        taskExecutor->runTask(TaskThread::MAIN, [this, surfaceId, width, height, viewportOffsetX, viewportOffsetY, pixelRatio]() {
            auto layoutConstraints = surfaceHandlers[surfaceId]->getLayoutConstraints();
            layoutConstraints.minimumSize = layoutConstraints.maximumSize = {
                .width = width,
                .height = height};
            auto layoutContext = surfaceHandlers[surfaceId]->getLayoutContext();
            layoutContext.viewportOffset = {viewportOffsetX, viewportOffsetY};
            layoutContext.pointScaleFactor = pixelRatio;
            surfaceHandlers[surfaceId]->constraintLayout(layoutConstraints, layoutContext);
        });
    } catch (const std::exception &e) {
        LOG(ERROR) << "updateSurfaceConstraints: " << e.what() << "\n";
        throw e;
    };
}

void rnoh::RNInstance::emitComponentEvent(napi_env env, react::Tag tag, std::string eventName, napi_value payload) {
    EventEmitRequestHandler::Context ctx{
        .env = env,
        .tag = tag,
        .eventName = std::move(eventName),
        .payload = payload,
        .shadowViewRegistry = this->m_shadowViewRegistry,
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
    if (auto state = m_shadowViewRegistry->getFabricState<facebook::react::State>(tag)) {
        m_mutationsToNapiConverter.updateState(env, componentName, state, newState);
    }
}

void RNInstance::callFunction(std::string &&module, std::string &&method, folly::dynamic &&params) {
    this->taskExecutor->runTask(TaskThread::JS, [this, module = std::move(module), method = std::move(method), params = std::move(params)]() mutable {
        this->instance->callJSFunction(std::move(module), std::move(method), std::move(params));
    });
}

void RNInstance::onAnimationStarted() {
    m_shouldRelayUITick.store(true);
}

void RNInstance::onAllAnimationsComplete() {
    m_shouldRelayUITick.store(false);
}

void RNInstance::onUITick() {
    if (this->m_shouldRelayUITick.load()) {
        this->scheduler->animationTick();
    }
}
