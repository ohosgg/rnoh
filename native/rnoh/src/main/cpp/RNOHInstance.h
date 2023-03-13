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
#include <react/renderer/scheduler/SurfaceHandler.h>


class RNOHInstance {
    public:
    RNOHInstance(std::function<void(int)> onComponentDescriptorTreeChanged)
        :
        surfaceHandler("Root", 1),
        instance(std::make_shared<facebook::react::Instance>()),
        onComponentDescriptorTreeChanged(onComponentDescriptorTreeChanged) {}
    
    
    void start();
    void simulateComponentDescriptorTreeUpdate();

    
    private:
    std::shared_ptr<facebook::react::Instance> instance;
    std::function<void(int)> onComponentDescriptorTreeChanged;
    facebook::react::SurfaceHandler surfaceHandler;
    
    void initialize();
    void runApplication();
};


#endif //native_RNOHInstance_H
