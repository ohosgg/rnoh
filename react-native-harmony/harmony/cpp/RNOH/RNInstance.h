#ifndef native_RNOHInstance_H
#define native_RNOHInstance_H
#include <memory>
#include <utility>
#include <thread>
#include <functional>
#include <napi/native_api.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <atomic>

#include <cxxreact/Instance.h>
#include <cxxreact/ModuleRegistry.h>
#include <cxxreact/NativeModule.h>
#include <folly/dynamic.h>
#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/animations/LayoutAnimationDriver.h>
#include <react/renderer/uimanager/LayoutAnimationStatusDelegate.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <ReactCommon/LongLivedObject.h>

#include "RNOH/MessageQueueThread.h"
#include "RNOH/SchedulerDelegate.h"
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOH/EventDispatcher.h"
#include "RNOH/EventEmitRequestHandler.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"
#include "RNOH/UITicker.h"
namespace rnoh {
using MutationsListener = std::function<void(MutationsToNapiConverter, facebook::react::ShadowViewMutationList const &mutations)>;

class RNInstance : public facebook::react::LayoutAnimationStatusDelegate {
  public:
    RNInstance(int id,
               std::shared_ptr<facebook::react::ContextContainer> contextContainer,
               TurboModuleFactory &&turboModuleFactory,
               std::shared_ptr<TaskExecutor> taskExecutor,
               std::shared_ptr<facebook::react::ComponentDescriptorProviderRegistry> componentDescriptorProviderRegistry,
               MutationsToNapiConverter mutationsToNapiConverter,
               EventEmitRequestHandlers eventEmitRequestHandlers,
               MutationsListener &&mutationsListener,
               MountingManager::CommandDispatcher &&commandDispatcher,
               UITicker::Shared uiTicker)
        : m_id(id),
          instance(std::make_shared<facebook::react::Instance>()),
          m_contextContainer(contextContainer),
          scheduler(nullptr),
          taskExecutor(taskExecutor),
          shadowViewRegistry(std::make_shared<ShadowViewRegistry>()),
          m_turboModuleFactory(std::move(turboModuleFactory)),
          m_componentDescriptorProviderRegistry(componentDescriptorProviderRegistry),
          m_mutationsToNapiConverter(mutationsToNapiConverter),
          m_eventEmitRequestHandlers(eventEmitRequestHandlers),
          m_shouldRelayUITick(false),
          m_mutationsListener(mutationsListener),
          m_commandDispatcher(commandDispatcher),
          m_uiTicker(uiTicker) {
        this->unsubscribeUITickListener = this->m_uiTicker->subscribe(m_id, [this]() {
            this->taskExecutor->runTask(TaskThread::MAIN, [this]() {
                this->onUITick();
            });
        });
    }

    ~RNInstance() {
        if (this->unsubscribeUITickListener != nullptr) {
            unsubscribeUITickListener();
        }
    }

    void start();
    void loadScript(std::vector<uint8_t> &&bundle, std::string const sourceURL, std::function<void(const std::string)> &&onFinish);
    void createSurface(facebook::react::Tag surfaceId, std::string const &moduleName);
    void updateSurfaceConstraints(facebook::react::Tag surfaceId, float width, float height, float viewportOffsetX, float viewportOffsetY);
    void startSurface(facebook::react::Tag surfaceId, float width, float height, float viewportOffsetX, float viewportOffsetY, folly::dynamic &&initialProps, std::function<void()> &&onFinish);
    void setSurfaceProps(facebook::react::Tag surfaceId, folly::dynamic &&props);
    void stopSurface(facebook::react::Tag surfaceId, std::function<void()> &&onFinish);
    void destroySurface(facebook::react::Tag surfaceId, std::function<void()> &&onFinish);
    void setSurfaceDisplayMode(facebook::react::Tag surfaceId, facebook::react::DisplayMode displayMode);
    void callFunction(std::string &&module, std::string &&method, folly::dynamic &&params);
    void emitComponentEvent(napi_env env, facebook::react::Tag tag, std::string eventName, napi_value payload);
    void onMemoryLevel(size_t memoryLevel);
    void updateState(napi_env env, std::string const &componentName, facebook::react::Tag tag, napi_value newState);

    std::shared_ptr<TaskExecutor> taskExecutor;

  private:
    int m_id;
    facebook::react::ContextContainer::Shared m_contextContainer;
    std::shared_ptr<facebook::react::Instance> instance;
    std::map<facebook::react::Tag, std::shared_ptr<facebook::react::SurfaceHandler>> surfaceHandlers;
    MutationsListener m_mutationsListener;
    MountingManager::CommandDispatcher m_commandDispatcher;
    std::unique_ptr<facebook::react::Scheduler> scheduler;
    std::unique_ptr<SchedulerDelegate> schedulerDelegate;
    std::shared_ptr<facebook::react::ComponentDescriptorProviderRegistry> m_componentDescriptorProviderRegistry;
    ShadowViewRegistry::Shared shadowViewRegistry;
    TurboModuleFactory m_turboModuleFactory;
    std::shared_ptr<EventDispatcher> m_eventDispatcher;
    MutationsToNapiConverter m_mutationsToNapiConverter;
    EventEmitRequestHandlers m_eventEmitRequestHandlers;
    std::shared_ptr<facebook::react::LayoutAnimationDriver> m_animationDriver;
    UITicker::Shared m_uiTicker;
    std::function<void()> unsubscribeUITickListener = nullptr;
    std::atomic<bool> m_shouldRelayUITick;

    void initialize();
    void initializeScheduler();
    void onUITick();

    virtual void onAnimationStarted() override;      // react::LayoutAnimationStatusDelegate
    virtual void onAllAnimationsComplete() override; // react::LayoutAnimationStatusDelegate
};

} // namespace rnoh
#endif // native_RNOHInstance_H
