#pragma once
#include "napi/native_api.h"
#include <memory>
#include <string>
#include <array>
#include <vector>
#include <react/renderer/components/view/ViewComponentDescriptor.h>
#include <react/renderer/components/image/ImageComponentDescriptor.h>
#include <react/renderer/components/text/TextComponentDescriptor.h>
#include <react/renderer/components/text/RawTextComponentDescriptor.h>
#include <react/renderer/components/text/ParagraphComponentDescriptor.h>
#include <react/renderer/components/textinput/TextInputComponentDescriptor.h>
#include <react/renderer/components/scrollview/ScrollViewComponentDescriptor.h>
#include "RNOH/ArkJS.h"
#include "RNOH/RNInstance.h"
#include "RNOH/MutationsToNapiConverter.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOH/ArkTSTurboModule.h"
#include "RNOH/PackageProvider.h"
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"
#include "RNOHCorePackage/ComponentBinders/ImageViewComponentJSIBinder.h"
#include "RNOHCorePackage/ComponentBinders/ScrollViewComponentJSIBinder.h"
#include "RNOHCorePackage/RNOHCorePackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<TurboModuleFactoryDelegate>> createTurboModuleFactoryDelegatesFromPackages(std::vector<std::shared_ptr<Package>> packages) {
    std::vector<std::shared_ptr<TurboModuleFactoryDelegate>> results;
    for (auto &package : packages) {
        results.push_back(package->createTurboModuleFactoryDelegate());
    }
    return results;
}

std::unique_ptr<RNInstance> createRNInstance(napi_env env, napi_ref arkTsTurboModuleProviderRef) {
    PackageProvider packageProvider;
    auto packages = packageProvider.getPackages({});
    packages.insert(packages.begin(), std::make_shared<RNOHCorePackage>(Package::Context{}));
    auto taskExecutor = std::make_shared<TaskExecutor>(env);
    auto componentDescriptorProviderRegistry = std::make_shared<react::ComponentDescriptorProviderRegistry>();
    componentDescriptorProviderRegistry->add(react::concreteComponentDescriptorProvider<react::ViewComponentDescriptor>());
    componentDescriptorProviderRegistry->add(react::concreteComponentDescriptorProvider<react::ImageComponentDescriptor>());
    componentDescriptorProviderRegistry->add(react::concreteComponentDescriptorProvider<react::TextComponentDescriptor>());
    componentDescriptorProviderRegistry->add(react::concreteComponentDescriptorProvider<react::RawTextComponentDescriptor>());
    componentDescriptorProviderRegistry->add(react::concreteComponentDescriptorProvider<react::ParagraphComponentDescriptor>());
    componentDescriptorProviderRegistry->add(react::concreteComponentDescriptorProvider<react::TextInputComponentDescriptor>());
    componentDescriptorProviderRegistry->add(react::concreteComponentDescriptorProvider<react::ScrollViewComponentDescriptor>());
    const ComponentJSIBinderByString componentBinderByName = {
        {"RCTView", std::make_shared<ViewComponentJSIBinder>()},
        {"RCTImageView", std::make_shared<ImageViewComponentJSIBinder>()},
        {"RCTVirtualText", std::make_shared<ViewComponentJSIBinder>()},
        {"RCTSinglelineTextInputView", std::make_shared<ViewComponentJSIBinder>()},
        {"RCTScrollView", std::make_shared<ScrollViewComponentJSIBinder>()}};
    auto turboModuleFactory = TurboModuleFactory(env, arkTsTurboModuleProviderRef,
                                                 std::move(componentBinderByName),
                                                 taskExecutor,
                                                 createTurboModuleFactoryDelegatesFromPackages(packages));
    return std::make_unique<RNInstance>(env,
                                        std::move(turboModuleFactory),
                                        taskExecutor, componentDescriptorProviderRegistry);
}
