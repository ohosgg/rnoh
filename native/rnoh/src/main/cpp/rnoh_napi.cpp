#include "napi/native_api.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <memory>
#include <string>
#include <array>
#include <vector>
#include "RNOH/ArkJS.h"
#include "RNOH/RNInstance.h"
#include <react/renderer/mounting/ShadowViewMutation.h>
#include "RNOH/MutationsToNapiConverter.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOHCorePackage/ViewManager.h"
#include "RNOHCorePackage/ImageViewManager.h"

using namespace rnoh;

static napi_ref listener_ref;
static napi_ref arkTsTurboModuleProviderRef;

std::unique_ptr<RNInstance> rnohInstance;

void createRNOHInstance(napi_env env) {
    auto taskExecutor = std::make_shared<TaskExecutor>(env);
    const ComponentManagerBindingByString componentManagerBindingByName = {
        {"RCTView", std::make_shared<ViewManager>()},
        {"RCTImageView", std::make_shared<ImageViewManager>()},
        {"RCTVirtualText", std::make_shared<ViewManager>()},
        {"RCTSinglelineTextInputView", std::make_shared<ViewManager>()},
    };
    auto turboModuleFactory = TurboModuleFactory(env, arkTsTurboModuleProviderRef, std::move(componentManagerBindingByName), taskExecutor);
    rnohInstance = std::make_unique<RNInstance>(env,
                                                  std::move(turboModuleFactory),
                                                  taskExecutor);
}

static napi_value initializeReactNative(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    createRNOHInstance(env);
    rnohInstance->start();
    return arkJs.getUndefined();
}

static napi_value registerTurboModuleProvider(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 1);
    arkTsTurboModuleProviderRef = arkJs.createReference(args[0]);
    return arkJs.getUndefined();
}

static napi_value subscribeToShadowTreeChanges(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 1);
    listener_ref = arkJs.createReference(args[0]);
    rnohInstance->registerSurface([env](auto const &mutations) {
        ArkJS ark_js(env);
        MutationsToNapiConverter mutationsToNapiConverter(env);
        auto napiMutations = mutationsToNapiConverter.convert(mutations);
        std::array<napi_value, 1> args = {napiMutations};
        auto listener = ark_js.getReferenceValue(listener_ref);
        ark_js.call(listener, args);
    });
    return arkJs.getUndefined();
}

static napi_value startReactNative(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);

    rnohInstance->runApplication(arkJs.getDouble(args[0]), arkJs.getDouble(args[1]));
    return arkJs.getUndefined();
}

static napi_value emitEvent(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    double tag, eventKind;
    napi_get_value_double(env, args[0], &tag);
    napi_get_value_double(env, args[1], &eventKind);

    rnohInstance->emitEvent(tag, (rnoh::ReactEventKind)eventKind, args[2]);

    return arkJs.getUndefined();
}

EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports) {
    napi_property_descriptor desc[] = {
        {"subscribeToShadowTreeChanges", nullptr, subscribeToShadowTreeChanges, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"initializeReactNative", nullptr, initializeReactNative, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"startReactNative", nullptr, startReactNative, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"emitEvent", nullptr, emitEvent, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"registerTurboModuleProvider", nullptr, registerTurboModuleProvider, nullptr, nullptr, nullptr, napi_default, nullptr}};

    napi_define_properties(env, exports, sizeof(desc) / sizeof(napi_property_descriptor), desc);
    return exports;
}
EXTERN_C_END

static napi_module demoModule = {
    .nm_version = 1,
    .nm_flags = 0,
    .nm_filename = nullptr,
    .nm_register_func = Init,
    .nm_modname = "entry",
    .nm_priv = ((void *)0),
    .reserved = {0},
};

extern "C" __attribute__((constructor)) void RegisterEntryModule(void) {
    napi_module_register(&demoModule);
}
