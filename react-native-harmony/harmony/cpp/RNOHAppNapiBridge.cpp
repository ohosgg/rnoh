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
#include "RNOH/UITicker.h"
#include "RNInstanceFactory.h"

using namespace rnoh;

std::unordered_map<size_t, std::unique_ptr<RNInstance>> rnInstanceById;
auto uiTicker = std::make_shared<UITicker>();

static napi_value cleanUp(napi_env env, napi_callback_info info) {
    LogSink::initializeLogging();
    LOG(INFO) << "cleanUp";
    /**
     * This CPP code can survive closing an app. The app can be closed before removing all RNInstances.
     * As a workaround, all rnInstances are removed on the start.
     */
    rnInstanceById.clear();
    ArkJS arkJs(env);
    return arkJs.getUndefined();
}

static napi_value createReactNativeInstance(napi_env env, napi_callback_info info) {
    LOG(INFO) << "createReactNativeInstance";
#ifdef REACT_NATIVE_DEBUG
    std::string warning =
        "\n"
        ".--------------------------------.\n"
        "| REACT_NATIVE_DEBUG is enabled! |\n"
        "'--------------------------------'\n";
    LOG(WARNING) << warning;
    LOG(WARNING)
        << "REACT_NATIVE_DEBUG is enabled. The performance is heavily affected. Do not run debug mode on production!";
#endif
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 6);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto arkTsTurboModuleProviderRef = arkJs.createReference(args[1]);
    auto mutationsListenerRef = arkJs.createReference(args[2]);
    auto commandDispatcherRef = arkJs.createReference(args[3]);
    auto eventDispatcherRef = arkJs.createReference(args[4]);
    auto measureTextFnRef = arkJs.createReference(args[5]);
    auto rnInstance = createRNInstance(
        instanceId,
        env,
        arkTsTurboModuleProviderRef,
        [env, instanceId, mutationsListenerRef](MutationsToNapiConverter mutationsToNapiConverter, auto const &mutations) {
            if (rnInstanceById.find(instanceId) == rnInstanceById.end()) {
                LOG(WARNING) << "RNInstance with the following id " + std::to_string(instanceId) + " does not exist";
                return;
            }
            ArkJS arkJs(env);
            auto napiMutations = mutationsToNapiConverter.convert(env, mutations);
            std::array<napi_value, 1> args = {napiMutations};
            auto listener = arkJs.getReferenceValue(mutationsListenerRef);
            arkJs.call<1>(listener, args);
        },
        [env, instanceId, commandDispatcherRef](auto tag, auto const &commandName, auto args) {
            if (rnInstanceById.find(instanceId) == rnInstanceById.end()) {
                LOG(WARNING) << "RNInstance with the following id " + std::to_string(instanceId) + " does not exist";
                return;
            }
            ArkJS arkJs(env);
            auto napiArgs = arkJs.convertIntermediaryValueToNapiValue(args);
            std::array<napi_value, 3> napiArgsArray = {arkJs.createDouble(tag), arkJs.createString(commandName), napiArgs};
            auto commandDispatcher = arkJs.getReferenceValue(commandDispatcherRef);
            arkJs.call<3>(commandDispatcher, napiArgsArray);
        },
        measureTextFnRef,
        eventDispatcherRef,
        uiTicker);

    if (rnInstanceById.find(instanceId) != rnInstanceById.end()) {
        LOG(FATAL) << "RNInstance with the following id " + std::to_string(instanceId) + " has been already created";
    }
    auto [it, _inserted] = rnInstanceById.emplace(instanceId, std::move(rnInstance));
    it->second->start();
    return arkJs.getUndefined();
}

static napi_value destroyReactNativeInstance(napi_env env, napi_callback_info info) {
    LOG(INFO) << "destroyReactNativeInstance";
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 1);
    size_t rnInstanceId = arkJs.getDouble(args[0]);
    rnInstanceById.erase(rnInstanceId);
    return arkJs.getUndefined();
}

static napi_value loadScript(napi_env env, napi_callback_info info) {
    LOG(INFO) << "loadScript";
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
    LOG(INFO) << "updateSurfaceConstraints\n";
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 7);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    rnInstance->updateSurfaceConstraints(arkJs.getDouble(args[1]),
                                         arkJs.getDouble(args[2]),
                                         arkJs.getDouble(args[3]),
                                         arkJs.getDouble(args[4]),
                                         arkJs.getDouble(args[5]),
                                         arkJs.getDouble(args[6]));
    return arkJs.getUndefined();
}

static napi_value createSurface(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    LOG(INFO) << "createSurface: surfaceId=" << surfaceId;
    auto appKey = arkJs.getString(args[2]);
    rnInstance->createSurface(surfaceId, appKey);
    return arkJs.getUndefined();
}

static napi_value startSurface(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 8);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    LOG(INFO) << "startSurface: surfaceId=" << surfaceId << "\n";
    rnInstance->startSurface(surfaceId,
                             arkJs.getDouble(args[2]),
                             arkJs.getDouble(args[3]),
                             arkJs.getDouble(args[4]),
                             arkJs.getDouble(args[5]),
                             arkJs.getDouble(args[6]),
                             arkJs.getDynamic(args[7]));
    return arkJs.getUndefined();
}

static napi_value setSurfaceProps(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    LOG(INFO) << "setSurfaceProps: surfaceId=" << surfaceId << "\n";
    rnInstance->setSurfaceProps(arkJs.getDouble(args[1]), arkJs.getDynamic(args[2]));
    return arkJs.getUndefined();
}

static napi_value stopSurface(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto &rnInstance = rnInstanceById.at(instanceId);
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    LOG(INFO) << "stopSurface: surfaceId=" << surfaceId << "\n";
    rnInstance->stopSurface(surfaceId);
    return arkJs.getUndefined();
}

static napi_value destroySurface(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 2);
    size_t instanceId = arkJs.getDouble(args[0]);
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    LOG(INFO) << "destroySurface: surfaceId=" << surfaceId << "\n";
    auto &rnInstance = rnInstanceById.at(instanceId);
    rnInstance->destroySurface(surfaceId);
    return arkJs.getUndefined();
}

static napi_value setSurfaceDisplayMode(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 3);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto it = rnInstanceById.find(instanceId);
    if (it == rnInstanceById.end()) {
        return arkJs.getUndefined();
    }
    auto &rnInstance = it->second; 
    facebook::react::Tag surfaceId = arkJs.getDouble(args[1]);
    LOG(INFO) << "setSurfaceDisplayMode: surfaceId=" << surfaceId << "\n";
    rnInstance->setSurfaceDisplayMode(surfaceId, static_cast<facebook::react::DisplayMode>(arkJs.getDouble(args[2])));
    return arkJs.getUndefined();
}

static napi_value emitComponentEvent(napi_env env, napi_callback_info info) {
    ArkJS arkJs(env);
    auto args = arkJs.getCallbackArgs(info, 5);
    size_t instanceId = arkJs.getDouble(args[0]);
    auto it = rnInstanceById.find(instanceId);
    if (it == rnInstanceById.end()) {
        return arkJs.getUndefined();
    }
    auto &rnInstance = it->second;
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
    auto it = rnInstanceById.find(instanceId);
    if (it == rnInstanceById.end()) {
        return arkJs.getUndefined();
    }
    auto &rnInstance = it->second; 
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
        {"cleanUp", nullptr, cleanUp, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"createReactNativeInstance", nullptr, createReactNativeInstance, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"destroyReactNativeInstance", nullptr, destroyReactNativeInstance, nullptr, nullptr, nullptr, napi_default, nullptr},
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
