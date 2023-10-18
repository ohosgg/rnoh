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
#include "RNOHCorePackage/RNOHCorePackage.h"
#include "RNOH/EventEmitRequestHandler.h"
#include "RNOH/TextMeasurer.h"
#include "RNOH/UITicker.h"

using namespace rnoh;

std::unique_ptr<RNInstance> createRNInstance(int id, napi_env env, napi_ref arkTsTurboModuleProviderRef, napi_ref measureTextFnRef, UITicker::Shared uiTicker) {
    static std::shared_ptr<TaskExecutor> taskExecutor = nullptr;
    if (taskExecutor == nullptr) {
        taskExecutor = std::make_shared<TaskExecutor>(env);
    }

    auto contextContainer = std::make_shared<facebook::react::ContextContainer>();
    auto textMeasurer = std::make_shared<TextMeasurer>(env, measureTextFnRef, taskExecutor);
    contextContainer->insert("textLayoutManagerDelegate", textMeasurer);
    PackageProvider packageProvider;
    auto packages = packageProvider.getPackages({});
    packages.insert(packages.begin(), std::make_shared<RNOHCorePackage>(Package::Context{}));

    auto componentDescriptorProviderRegistry = std::make_shared<facebook::react::ComponentDescriptorProviderRegistry>();
    std::vector<std::shared_ptr<TurboModuleFactoryDelegate>> turboModuleFactoryDelegates;
    ComponentJSIBinderByString componentJSIBinderByName = {};
    ComponentNapiBinderByString componentNapiBinderByName = {};
    EventEmitRequestHandlers eventEmitRequestHandlers = {};

    for (auto &package : packages) {
        auto turboModuleFactoryDelegate = package->createTurboModuleFactoryDelegate();
        if (turboModuleFactoryDelegate != nullptr) {
            turboModuleFactoryDelegates.push_back(std::move(turboModuleFactoryDelegate));
        }
        for (auto componentDescriptorProvider : package->createComponentDescriptorProviders()) {
            componentDescriptorProviderRegistry->add(componentDescriptorProvider);
        }
        for (auto [name, componentJSIBinder] : package->createComponentJSIBinderByName()) {
            componentJSIBinderByName.insert({name, componentJSIBinder});
        };
        for (auto [name, componentNapiBinder] : package->createComponentNapiBinderByName()) {
            componentNapiBinderByName.insert({name, componentNapiBinder});
        };
        auto packageEventEmitRequestHandlers = package->createEventEmitRequestHandlers();
        eventEmitRequestHandlers.insert(
            eventEmitRequestHandlers.end(),
            std::make_move_iterator(packageEventEmitRequestHandlers.begin()),
            std::make_move_iterator(packageEventEmitRequestHandlers.end()));
    }

    auto turboModuleFactory = TurboModuleFactory(env, arkTsTurboModuleProviderRef,
                                                 std::move(componentJSIBinderByName),
                                                 taskExecutor,
                                                 std::move(turboModuleFactoryDelegates));
    return std::make_unique<RNInstance>(id,
                                        contextContainer,
                                        std::move(turboModuleFactory),
                                        taskExecutor,
                                        componentDescriptorProviderRegistry,
                                        MutationsToNapiConverter(std::move(componentNapiBinderByName)),
                                        eventEmitRequestHandlers,
                                        uiTicker);
}
