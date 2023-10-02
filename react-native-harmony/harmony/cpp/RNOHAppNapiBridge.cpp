#include "napi/native_api.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <memory>
#include <string>
#include <array>
#include <vector>
#include <unordered_map>
#include "RNOH/ArkJS.h"
#include "RNOH/RNInstance.h"
#include "RNOH/LogSink.h"
#include "RNInstanceFactory.h"

using namespace rnoh;

std::unordered_map<size_t, std::unique_ptr<RNInstance>> rnInstanceById;

static napi_value initializeReactNative(napi_env env, napi_callback_info info) {
    LogSink::initializeLogging();
    LOG(INFO) << "initializeReactNative"
              << "\n";
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto arkTsTurboModuleProviderRef = arkJs.createReference(args[1]);
    auto measureTextFnRef = arkJs.createReference(args[2]);
    auto rnInstance = createRNInstance(env, arkTsTurboModuleProviderRef, measureTextFnRef);
    auto [it, inserted] = rnInstanceById.insert_or_assign(instanceId, std::move(rnInstance));
    it->second->start();
    return arkJs.getUndefined();
}

static napi_value subscribeToShadowTreeChanges(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    auto listener_ref = arkJs.createReference(args[1]);
    auto commandDispatcherRef = arkJs.createReference(args[2]);
    rnInstance->registerSurface(
        [env, listener_ref](MutationsToNapiConverter mutationsToNapiConverter, auto const &mutations) {
            ArkJS arkJs(env);
            auto napiMutations = mutationsToNapiConverter.convert(env, mutations);
            std::array<napi_value, 1> args = {napiMutations};
            auto listener = arkJs.getReferenceValue(listener_ref);
            arkJs.call<1>(listener, args);
        },
        [env, commandDispatcherRef](auto tag, auto const &commandName, auto args) {
            ArkJS arkJs(env);
            auto napiArgs = arkJs.convertIntermediaryValueToNapiValue(args);
            std::array<napi_value, 3> napiArgsArray = {arkJs.createDouble(tag), arkJs.createString(commandName), napiArgs};
            auto commandDispatcher = arkJs.getReferenceValue(commandDispatcherRef);
            arkJs.call<3>(commandDispatcher, napiArgsArray);
        });
    return arkJs.getUndefined();
}

static napi_value loadScript(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 4);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    auto onFinishRef = arkJs.createReference(args[3]);
    rnInstance->loadScript(
        arkJs.getArrayBuffer(args[1]),
        arkJs.getString(args[2]),
        [taskExecutor = rnInstance->taskExecutor, env, onFinishRef](const std::string errorMsg) {
            taskExecutor->runTask(TaskThread::MAIN, [env, onFinishRef, errorMsg = std::move(errorMsg)]() {
                ArkJS arkJs(env);
                auto listener = arkJs.getReferenceValue(onFinishRef);
                arkJs.call<1>(listener, {arkJs.createString(errorMsg)});
                arkJs.deleteReference(onFinishRef);
            });
        });
    return arkJs.getUndefined();
}

static napi_value updateSurfaceConstraints(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 7);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    rnInstance->updateSurfaceConstraints(arkJs.getDouble(args[1]),
                                         arkJs.getDouble(args[2]),
                                         arkJs.getDouble(args[3]),
                                         arkJs.getDouble(args[4]),
                                         arkJs.getDouble(args[5]));
    return arkJs.getUndefined();
}

static napi_value createSurface(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    auto appKey = arkJs.getString(args[2]);
    rnInstance->createSurface(surfaceId, appKey);
    return arkJs.getUndefined();
}

static napi_value startSurface(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 8);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    rnInstance->startSurface(arkJs.getDouble(args[1]),
                             arkJs.getDouble(args[2]),
                             arkJs.getDouble(args[3]),
                             arkJs.getDouble(args[4]),
                             arkJs.getDouble(args[5]),
                             arkJs.getDynamic(args[6]));
    return arkJs.getUndefined();
}

static napi_value setSurfaceProps(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    rnInstance->setSurfaceProps(arkJs.getDouble(args[1]), arkJs.getDynamic(args[2]));
    return arkJs.getUndefined();
}

static napi_value stopSurface(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    rnInstance->stopSurface(arkJs.getDouble(args[1]));
    return arkJs.getUndefined();
}

static napi_value destroySurface(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    rnInstance->destroySurface(arkJs.getDouble(args[1]));
    return arkJs.getUndefined();
}

static napi_value setSurfaceDisplayMode(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    rnInstance->setSurfaceDisplayMode(arkJs.getDouble(args[1]), static_cast<facebook::react::DisplayMode>(arkJs.getDouble(args[2])));
    return arkJs.getUndefined();
}

static napi_value emitComponentEvent(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 5);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    rnInstance->emitComponentEvent(env,
                                   arkJs.getDouble(args[1]),
                                   arkJs.getString(args[2]),
                                   args[3]);
    return arkJs.getUndefined();
}

static napi_value callRNFunction(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 4);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    auto moduleString = arkJs.getString(args[1]);
    auto nameString = arkJs.getString(args[2]);
    auto argsDynamic = arkJs.getDynamic(args[3]);

    rnInstance->callFunction(std::move(moduleString), std::move(nameString), std::move(argsDynamic));

    return arkJs.getUndefined();
}

static napi_value onMemoryLevel(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 1);
    auto memoryLevel = arkJs.getDouble(args[0]);
    for (auto &[id, instance] : rnInstanceById) {
        if (instance != nullptr) {
            instance->onMemoryLevel(static_cast<size_t>(memoryLevel));
        }
    }
    return arkJs.getUndefined();
}

static napi_value updateState(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 4);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    auto componentName = arkJs.getString(args[1]);
    auto tag = arkJs.getDouble(args[2]);
    auto state = args[3];
    rnInstance->updateState(env, componentName, static_cast<facebook::react::Tag>(tag), state);
    return arkJs.getUndefined();
}

EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports) {
    napi_property_descriptor desc[] = {
        {"subscribeToShadowTreeChanges", nullptr, subscribeToShadowTreeChanges, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"initializeReactNative", nullptr, initializeReactNative, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"loadScript", nullptr, loadScript, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"startSurface", nullptr, startSurface, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"stopSurface", nullptr, stopSurface, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"destroySurface", nullptr, destroySurface, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"createSurface", nullptr, createSurface, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"updateSurfaceConstraints", nullptr, updateSurfaceConstraints, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"setSurfaceDisplayMode", nullptr, setSurfaceDisplayMode, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"emitComponentEvent", nullptr, emitComponentEvent, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"callRNFunction", nullptr, callRNFunction, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"onMemoryLevel", nullptr, onMemoryLevel, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"updateState", nullptr, updateState, nullptr, nullptr, nullptr, napi_default, nullptr}};

    napi_define_properties(env, exports, sizeof(desc) / sizeof(napi_property_descriptor), desc);
    return exports;
}
EXTERN_C_END

static napi_module demoModule = {
    .nm_version = 1,
    .nm_flags = 0,
    .nm_filename = nullptr,
    .nm_register_func = Init,
    .nm_modname = "rnoh_app",
    .nm_priv = ((void *)0),
    .reserved = {0},
};

extern "C" __attribute__((constructor)) void RegisterEntryModule(void) {
    napi_module_register(&demoModule);
}
