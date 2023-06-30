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
#include "RNOH/EventEmitterRegistry.h"
#include "RNOH/TurboModuleFactory.h"
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
               EventEmitRequestHandlerByString eventEmitRequestHandlerByName)
        : instance(std::make_shared<facebook::react::Instance>()),
          m_contextContainer(contextContainer),
          scheduler(nullptr),
          taskExecutor(taskExecutor),
          eventEmitterRegistry(std::make_shared<EventEmitterRegistry>()),
          m_turboModuleFactory(std::move(turboModuleFactory)),
          m_componentDescriptorProviderRegistry(componentDescriptorProviderRegistry),
          m_mutationsToNapiConverter(mutationsToNapiConverter),
          m_eventEmitRequestHandlerByName(eventEmitRequestHandlerByName) {}

    void registerSurface(
        MutationsListener,
        MountingManager::CommandDispatcher);
    void start();
    void updateSurfaceConstraints(std::string const &moduleName, float width, float height);
    void loadScriptFromString(std::string const &&bundle, std::string const sourceURL);
    void runApplication(float width, float height, std::string const &moduleName, folly::dynamic &&initialProps);
    void callFunction(std::string &&module, std::string &&method, folly::dynamic &&params);
    void emitComponentEvent(napi_env env, facebook::react::Tag tag, std::string eventEmitRequestHandlerName, napi_value payload);

  private:
    std::shared_ptr<facebook::react::ContextContainer> m_contextContainer;
    std::shared_ptr<facebook::react::Instance> instance;
    std::map<std::string, std::shared_ptr<facebook::react::SurfaceHandler>> surfaceHandlers;
    std::function<void(MutationsToNapiConverter, facebook::react::ShadowViewMutationList const &mutations)> mutationsListener;
    MountingManager::CommandDispatcher commandDispatcher;
    std::unique_ptr<facebook::react::Scheduler> scheduler;
    std::unique_ptr<SchedulerDelegate> schedulerDelegate;
    std::shared_ptr<TaskExecutor> taskExecutor;
    std::shared_ptr<facebook::react::ComponentDescriptorProviderRegistry> m_componentDescriptorProviderRegistry;
    EventEmitterRegistry::Shared eventEmitterRegistry;
    TurboModuleFactory m_turboModuleFactory;
    MutationsToNapiConverter m_mutationsToNapiConverter;
    EventEmitRequestHandlerByString m_eventEmitRequestHandlerByName;

    void initialize();
    void initializeScheduler();
};

} // namespace rnoh
#endif // native_RNOHInstance_H
