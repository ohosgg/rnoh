#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>
#include "RNOHMessageQueueThread.h"
#include "RNOHInstance.h"
#include "RNOHEventBeat.h"
#include "RNOHLogSink.h"
#include "hermes/executor/HermesExecutorFactory.h"
#include "jsbundle.h"
#include <react/renderer/components/view/ViewComponentDescriptor.h>
#include <react/renderer/components/image/ImageComponentDescriptor.h>
#include <react/renderer/components/text/TextComponentDescriptor.h>
#include <react/renderer/components/text/RawTextComponentDescriptor.h>
#include <react/renderer/components/text/ParagraphComponentDescriptor.h>
#include <react/renderer/components/textinput/TextInputComponentDescriptor.h>
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include "mounting/events/EventEmitterRegistry.h"
#include "RNOHTurboModuleProvider.h"
#include "RNOHTurboModuleFactory.h"
#include "TurboModules/RNOHUIManagerModule.h"


using namespace facebook::react;
using namespace facebook::jsi;
using namespace rnoh;

void RNOHInstance::registerSurface(std::function<void(facebook::react::ShadowViewMutationList const &mutations)> listener) {
    this->onComponentDescriptorTreeChanged = listener;
}

void RNOHInstance::start() {
    RNOHLogSink::initializeLogging();

    this->initialize();
    this->initializeComponentDescriptorRegistry();
    this->initializeScheduler();
}

void RNOHInstance::initialize() {
    std::vector<std::unique_ptr<NativeModule>> modules;
    this->contextContainer = std::make_shared<facebook::react::ContextContainer>();
    this->taskExecutor = std::make_shared<rnoh::TaskExecutor>(env);
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

    std::make_shared<RNOHTurboModuleProvider>(this->instance->getJSCallInvoker(), std::move(m_turboModuleFactory))
        ->installJSBindings(this->instance->getRuntimeExecutor());
}

void RNOHInstance::initializeComponentDescriptorRegistry() {
    this->componentDescriptorProviderRegistry = std::make_shared<facebook::react::ComponentDescriptorProviderRegistry>();
    this->componentDescriptorProviderRegistry->add(concreteComponentDescriptorProvider<ViewComponentDescriptor>());
    this->componentDescriptorProviderRegistry->add(concreteComponentDescriptorProvider<ImageComponentDescriptor>());
    this->componentDescriptorProviderRegistry->add(concreteComponentDescriptorProvider<TextComponentDescriptor>());
    this->componentDescriptorProviderRegistry->add(concreteComponentDescriptorProvider<RawTextComponentDescriptor>());
    this->componentDescriptorProviderRegistry->add(concreteComponentDescriptorProvider<ParagraphComponentDescriptor>());
    this->componentDescriptorProviderRegistry->add(concreteComponentDescriptorProvider<TextInputComponentDescriptor>());
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

    this->schedulerDelegate = std::make_unique<RNOHSchedulerDelegate>(rnoh::MountingManager(
        taskExecutor,
        eventEmitterRegistry,
        [this](facebook::react::ShadowViewMutationList mutations) {
            LOG(INFO) << "Triggering ui update";
            this->onComponentDescriptorTreeChanged(mutations);
        }));
    this->scheduler = std::make_unique<facebook::react::Scheduler>(schedulerToolbox, nullptr, schedulerDelegate.get());
}

void RNOHInstance::runApplication(float width, float height) {
    try {
        auto jsBundle = std::make_unique<facebook::react::JSBigStdString>(JS_BUNDLE);
        this->instance->loadScriptFromString(std::move(jsBundle), "jsBundle.js", true);
        folly::dynamic config = folly::dynamic::object("rootTag", 1)("fabric", true);
        this->surfaceHandler.setProps(std::move(config));
        auto layoutConstraints = this->surfaceHandler.getLayoutConstraints();
        layoutConstraints.layoutDirection = LayoutDirection::LeftToRight;
        layoutConstraints.minimumSize = layoutConstraints.maximumSize = {
            .width = width,
            .height = height};
        this->surfaceHandler.constraintLayout(layoutConstraints, this->surfaceHandler.getLayoutContext());
        this->scheduler->registerSurface(this->surfaceHandler);
        this->surfaceHandler.start();
    } catch (const std::exception &e) {
        LOG(ERROR) << "runApplication: " << e.what() << "\n";
        return;
    }
}

void RNOHInstance::emitEvent(facebook::react::Tag tag, rnoh::ReactEventKind eventKind, napi_value eventObject) {
    this->eventEmitterHelper.emitEvent(tag, eventKind, eventObject);
}
