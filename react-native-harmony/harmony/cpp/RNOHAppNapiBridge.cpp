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

static napi_env workerEnv;
static napi_ref listener_ref;
static napi_ref arkTsTurboModuleProviderRef;
static napi_ref measureTextFnRef;

std::unique_ptr<RNInstance> rnInstance;

// static napi_value registerWorker(napi_env env, napi_callback_info info) {
//     ArkJS arkJs(env);
//     workerEnv = env;
//     auto args = arkJs.getCallbackArgs(info, 1);
//     measureTextFnRef = arkJs.createReference(args[0]);
//     return arkJs.getUndefined();
// }

static napi_value initializeReactNative(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    rnInstance = createRNInstance(env, env /* TODO: use workerEnv once worker registration works */, arkTsTurboModuleProviderRef, measureTextFnRef);
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

static napi_value loadScriptFromString(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    rnInstance->loadScriptFromString(
        arkJs.getString(args[0]),
        arkJs.getString(args[1]));
    return arkJs.getUndefined();
}

static napi_value startSurface(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 4);
    rnInstance->runApplication(arkJs.getDouble(args[0]),
                               arkJs.getDouble(args[1]),
                               arkJs.getString(args[2]),
                               arkJs.getDynamic(args[3]));
    return arkJs.getUndefined();
}

static napi_value emitComponentEvent(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    rnInstance->emitComponentEvent(env,
                                   arkJs.getDouble(args[0]),
                                   arkJs.getString(args[1]),
                                   args[2]);
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
        // {"registerWorker", nullptr, registerWorker, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"loadScriptFromString", nullptr, loadScriptFromString, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"startSurface", nullptr, startSurface, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"emitComponentEvent", nullptr, emitComponentEvent, nullptr, nullptr, nullptr, napi_default, nullptr},
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
