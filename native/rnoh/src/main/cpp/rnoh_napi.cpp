#include "napi/native_api.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <memory>
#include <string>
#include <array>
#include <vector>
#include "ArkJS.h"
#include "RNOHInstance.h"
#include <react/renderer/mounting/ShadowViewMutation.h>
#include "RNOHMutationsToNapiConverter.h"

static napi_ref listener_ref;

std::shared_ptr<RNOHInstance> rnohInstance;

static napi_value subscribeToShadowTreeChanges(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 1);
    listener_ref = arkJs.createReference(args[0]);
    rnohInstance = std::make_shared<RNOHInstance>(env, [env](auto const &mutations) {
        ArkJS ark_js(env);
        RNOHMutationsToNapiConverter mutationsToNapiConverter(env);
        auto napiMutations = mutationsToNapiConverter.convert(mutations);
        std::array<napi_value, 1> args = {napiMutations};
        auto listener = ark_js.getReferenceValue(listener_ref);
        ark_js.call(listener, args);
    });
    return arkJs.getUndefined();
}

static napi_value startReactNative(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    rnohInstance->start();
    rnohInstance->runApplication();
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
        {"startReactNative", nullptr, startReactNative, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"emitEvent", nullptr, emitEvent, nullptr, nullptr, nullptr, napi_default, nullptr}};

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
