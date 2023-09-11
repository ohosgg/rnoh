#ifndef native_RNOHInstance_H
#define native_RNOHInstance_H
#include <memory>
#include <utility>
#include <thread>
#include <functional>
#include <napi/native_api.h>
#include <js_native_api.h>
#include <js_native_api_types.h>

#include <cxxreact/Instance.h>
#include <cxxreact/ModuleRegistry.h>
#include <cxxreact/NativeModule.h>
#include <folly/dynamic.h>
#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <ReactCommon/LongLivedObject.h>

#include "RNOH/MessageQueueThread.h"
#include "RNOH/SchedulerDelegate.h"
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOH/EventDispatcher.h"
#include "RNOH/EventEmitRequestHandler.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"

namespace rnoh {
class RNInstance {
  public:
    using MutationsListener = std::function<void(MutationsToNapiConverter, facebook::react::ShadowViewMutationList const &mutations)>;

    RNInstance(std::shared_ptr<facebook::react::ContextContainer> contextContainer,
               TurboModuleFactory &&turboModuleFactory,
               std::shared_ptr<TaskExecutor> taskExecutor,
               std::shared_ptr<facebook::react::ComponentDescriptorProviderRegistry> componentDescriptorProviderRegistry,
               MutationsToNapiConverter mutationsToNapiConverter,
               EventEmitRequestHandlers eventEmitRequestHandlers)
        : instance(std::make_shared<facebook::react::Instance>()),
          m_contextContainer(contextContainer),
          scheduler(nullptr),
          taskExecutor(taskExecutor),
          shadowViewRegistry(std::make_shared<ShadowViewRegistry>()),
          m_turboModuleFactory(std::move(turboModuleFactory)),
          m_componentDescriptorProviderRegistry(componentDescriptorProviderRegistry),
          m_mutationsToNapiConverter(mutationsToNapiConverter),
          m_eventEmitRequestHandlers(eventEmitRequestHandlers) {}

    void registerSurface(
        MutationsListener&&,
        MountingManager::CommandDispatcher&&);
    void start();
    void loadScriptFromString(std::string const &&bundle, std::string const sourceURL);
    void createSurface(facebook::react::Tag surfaceId, std::string const &moduleName);
    void updateSurfaceConstraints(facebook::react::Tag surfaceId, std::string const &moduleName, float width, float height, float viewportOffsetX, float viewportOffsetY);
    void startSurface(facebook::react::Tag surfaceId, float width, float height, float viewportOffsetX, float viewportOffsetY, std::string const &moduleName, folly::dynamic &&initialProps);
    void stopSurface(facebook::react::Tag surfaceId);
    void destroySurface(facebook::react::Tag surfaceId);
    void callFunction(std::string &&module, std::string &&method, folly::dynamic &&params);
    void emitComponentEvent(napi_env env, facebook::react::Tag tag, std::string eventName, napi_value payload);
    void onMemoryLevel(size_t memoryLevel);
    void updateState(napi_env env, std::string const &componentName, facebook::react::Tag tag, napi_value newState);

  private:
    std::shared_ptr<facebook::react::ContextContainer> m_contextContainer;
    std::shared_ptr<facebook::react::Instance> instance;
    std::map<facebook::react::Tag, std::shared_ptr<facebook::react::SurfaceHandler>> surfaceHandlers;
    std::function<void(MutationsToNapiConverter, facebook::react::ShadowViewMutationList const &mutations)> mutationsListener;
    MountingManager::CommandDispatcher commandDispatcher;
    std::unique_ptr<facebook::react::Scheduler> scheduler;
    std::unique_ptr<SchedulerDelegate> schedulerDelegate;
    std::shared_ptr<TaskExecutor> taskExecutor;
    std::shared_ptr<facebook::react::ComponentDescriptorProviderRegistry> m_componentDescriptorProviderRegistry;
    ShadowViewRegistry::Shared shadowViewRegistry;
    TurboModuleFactory m_turboModuleFactory;
    std::shared_ptr<EventDispatcher> m_eventDispatcher;
    MutationsToNapiConverter m_mutationsToNapiConverter;
    EventEmitRequestHandlers m_eventEmitRequestHandlers;

    void initialize();
    void initializeScheduler();
};

} // namespace rnoh
#endif // native_RNOHInstance_H
