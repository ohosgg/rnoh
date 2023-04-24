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
#include "RNOH/TaskExecutor.h"
#include "RNOH/events/EventEmitterRegistry.h"
#include "RNOH/events/EventEmitterHelper.h"
#include "RNOH/TurboModuleFactory.h"

namespace rnoh {
class RNInstance {
  public:
    using MutationsListener = std::function<void(MutationsToNapiConverter, facebook::react::ShadowViewMutationList const &mutations)>;

    RNInstance(napi_env env,
               TurboModuleFactory &&turboModuleFactory,
               std::shared_ptr<TaskExecutor> taskExecutor,
               std::shared_ptr<react::ComponentDescriptorProviderRegistry> componentDescriptorProviderRegistry,
               MutationsToNapiConverter mutationsToNapiConverter)
        : surfaceHandler("rnempty", 1),
          instance(std::make_shared<facebook::react::Instance>()),
          scheduler(nullptr),
          taskExecutor(taskExecutor),
          eventEmitterRegistry(std::make_shared<EventEmitterRegistry>()),
          eventEmitterHelper(ArkJS(env), eventEmitterRegistry),
          m_turboModuleFactory(std::move(turboModuleFactory)),
          m_componentDescriptorProviderRegistry(componentDescriptorProviderRegistry),
          m_mutationsToNapiConverter(mutationsToNapiConverter) {}

    void registerSurface(
        MutationsListener,
        MountingManager::CommandDispatcher);
    void start();
    void runApplication(float width, float height);
    void emitEvent(facebook::react::Tag tag, ReactEventKind eventKind, napi_value eventObject);
    void callFunction(std::string &&module, std::string &&method, folly::dynamic &&params);

  private:
    std::shared_ptr<facebook::react::ContextContainer> contextContainer;
    std::shared_ptr<facebook::react::Instance> instance;
    std::function<void(MutationsToNapiConverter, facebook::react::ShadowViewMutationList const &mutations)> mutationsListener;
    MountingManager::CommandDispatcher commandDispatcher;
    facebook::react::SurfaceHandler surfaceHandler;
    std::unique_ptr<facebook::react::Scheduler> scheduler;
    std::unique_ptr<SchedulerDelegate> schedulerDelegate;
    std::shared_ptr<TaskExecutor> taskExecutor;
    std::shared_ptr<react::ComponentDescriptorProviderRegistry> m_componentDescriptorProviderRegistry;
    EventEmitterRegistry::Shared eventEmitterRegistry;
    EventEmitterHelper eventEmitterHelper;
    TurboModuleFactory m_turboModuleFactory;
    MutationsToNapiConverter m_mutationsToNapiConverter;

    void initialize();
    void initializeScheduler();
};

} // namespace rnoh
#endif // native_RNOHInstance_H
