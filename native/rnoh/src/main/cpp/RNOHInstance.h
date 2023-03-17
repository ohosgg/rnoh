#ifndef native_RNOHInstance_H
#define native_RNOHInstance_H
#include <memory>
#include <cxxreact/Instance.h>
#include <cxxreact/ModuleRegistry.h>
#include <cxxreact/NativeModule.h>
#include <folly/dynamic.h>
#include <utility>
#include <thread>
#include <functional>
#include <react/renderer/scheduler/Scheduler.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include "RNOHMessageQueueThread.h"
#include "RNOHSchedulerDelegate.h"

class RNOHInstance {
  public:
    RNOHInstance(std::function<void(int)> onComponentDescriptorTreeChanged)
        : surfaceHandler("rnempty", 1),
          instance(std::make_shared<facebook::react::Instance>()),
          scheduler(nullptr),
          taskExecutor(nullptr),
          onComponentDescriptorTreeChanged(onComponentDescriptorTreeChanged) {}

    void start();
    void simulateComponentDescriptorTreeUpdate();
    void runApplication();
    
  private:
    std::shared_ptr<facebook::react::ContextContainer> contextContainer;
    std::shared_ptr<facebook::react::Instance> instance;
    std::function<void(int)> onComponentDescriptorTreeChanged;
    facebook::react::SurfaceHandler surfaceHandler;
    std::unique_ptr<facebook::react::Scheduler> scheduler;
    std::unique_ptr<RNOHSchedulerDelegate> schedulerDelegate;
    std::shared_ptr<RNOHTaskExecutor> taskExecutor;
    std::shared_ptr<ComponentDescriptorProviderRegistry> componentDescriptorProviderRegistry;

    void initialize();
    void initializeScheduler();
    
};

#endif //native_RNOHInstance_H
