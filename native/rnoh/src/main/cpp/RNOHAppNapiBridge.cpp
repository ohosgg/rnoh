#include "napi/native_api.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <memory>
#include <string>
#include <array>
#include <vector>
#include "RNOH/ArkJS.h"
#include "RNOH/RNInstance.h"
#include "RNInstanceFactory.h"

using namespace rnoh;

static napi_ref listener_ref;
static napi_ref arkTsTurboModuleProviderRef;

std::unique_ptr<RNInstance> rnInstance;

static napi_value initializeReactNative(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    rnInstance = createRNInstance(env, arkTsTurboModuleProviderRef);
    rnInstance->start();
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
    auto args = arkJs.getCallbackArgs(info, 2);
    listener_ref = arkJs.createReference(args[0]);
    auto commandDispatcherRef = arkJs.createReference(args[1]);
    rnInstance->registerSurface(
        [env](MutationsToNapiConverter mutationsToNapiConverter, auto const &mutations) {
            ArkJS arkJs(env);
            auto napiMutations = mutationsToNapiConverter.convert(env, mutations);
            std::array<napi_value, 1> args = {napiMutations};
            auto listener = arkJs.getReferenceValue(listener_ref);
            arkJs.call(listener, args);
        },
        [env, commandDispatcherRef](auto tag, auto const &commandName, auto args) {
            ArkJS arkJs(env);
            auto napiArgs = arkJs.convertIntermediaryValueToNapiValue(args);
            std::array<napi_value, 3> napiArgsArray = {arkJs.createDouble(tag), arkJs.createString(commandName), napiArgs};
            auto commandDispatcher = arkJs.getReferenceValue(commandDispatcherRef);
            arkJs.call(commandDispatcher, napiArgsArray);
        });
    return arkJs.getUndefined();
}

static napi_value startReactNative(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);

    rnInstance->runApplication(arkJs.getDouble(args[0]), arkJs.getDouble(args[1]));
    return arkJs.getUndefined();
}

static napi_value emitEvent(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    double tag, eventKind;
    napi_get_value_double(env, args[0], &tag);
    napi_get_value_double(env, args[1], &eventKind);

    rnInstance->emitEvent(tag, (rnoh::ReactEventKind)eventKind, args[2]);

    return arkJs.getUndefined();
}

static napi_value callRNFunction(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    auto moduleString = arkJs.getString(args[0]);
    auto nameString = arkJs.getString(args[1]);
    auto argsDynamic = arkJs.getDynamic(args[2]);

    rnInstance->callFunction(std::move(moduleString), std::move(nameString), std::move(argsDynamic));

    return arkJs.getUndefined();
}

EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports) {
    napi_property_descriptor desc[] = {
        {"subscribeToShadowTreeChanges", nullptr, subscribeToShadowTreeChanges, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"initializeReactNative", nullptr, initializeReactNative, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"startReactNative", nullptr, startReactNative, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"emitEvent", nullptr, emitEvent, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"registerTurboModuleProvider", nullptr, registerTurboModuleProvider, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"callRNFunction", nullptr, callRNFunction, nullptr, nullptr, nullptr, napi_default, nullptr}};

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
