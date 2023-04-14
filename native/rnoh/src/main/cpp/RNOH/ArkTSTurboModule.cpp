#include <variant>
#include <jsi/JSIDynamic.h>
#include <ReactCommon/CallbackWrapper.h>
#include <ReactCommon/TurboModuleUtils.h>

#include "RNOH/JsiConversions.h"
#include "RNOH/TaskExecutor.h"
#include "RNOH/ArkTSTurboModule.h"

using namespace rnoh;
using namespace facebook;

using NapiCallback = std::function<napi_value(napi_env, std::vector<napi_value>)>;
using IntermediaryCallback = std::function<void(std::vector<folly::dynamic>)>;
using IntermediaryArg = std::variant<folly::dynamic, IntermediaryCallback>;

std::vector<IntermediaryArg> convertJSIValuesToIntermediaryValues(jsi::Runtime &runtime, std::shared_ptr<react::CallInvoker> jsInvoker, const jsi::Value *jsiArgs, size_t argsCount);
const std::vector<jsi::Value> convertDynamicsToJSIValues(jsi::Runtime &rt, const std::vector<folly::dynamic> &dynamics);
napi_value convertIntermediaryValueToNapiValue(ArkJS arkJs, IntermediaryArg arg);
std::vector<napi_value> convertIntermediaryValuesToNapiValues(ArkJS arkJs, std::vector<IntermediaryArg> args);

ArkTSTurboModule::ArkTSTurboModule(Context ctx, std::string name) : m_ctx(ctx), TurboModule(ctx, name) {}

jsi::Value ArkTSTurboModule::call(jsi::Runtime &runtime, const std::string &methodName, const jsi::Value *jsiArgs, size_t argsCount) {
    folly::dynamic result;
    auto args = convertJSIValuesToIntermediaryValues(runtime, m_ctx.jsInvoker, jsiArgs, argsCount);
    m_ctx.taskExecutor->runSyncTask(TaskThread::MAIN, [ctx = m_ctx, &methodName, &args, &result, &runtime]() {
        ArkJS arkJs(ctx.env);
        auto napiArgs = convertIntermediaryValuesToNapiValues(arkJs, args);
        auto napiTurboModuleObject = arkJs.getObject(ctx.arkTsTurboModuleInstanceRef);
        auto napiResult = napiTurboModuleObject.call(methodName, napiArgs);
        result = arkJs.getDynamic(napiResult);
    });
    return jsi::valueFromDynamic(runtime, result);
}

std::vector<IntermediaryArg> convertJSIValuesToIntermediaryValues(jsi::Runtime &runtime, std::shared_ptr<react::CallInvoker> jsInvoker, const jsi::Value *jsiArgs, size_t argsCount) {
    std::vector<IntermediaryArg> args(argsCount);
    for (int argIdx = 0; argIdx < argsCount; argIdx++) {
        if (jsiArgs[argIdx].isObject()) {
            auto obj = jsiArgs[argIdx].getObject(runtime);
            if (obj.isFunction(runtime)) {
                auto weakCbCtx = react::CallbackWrapper::createWeak(std::move(obj.getFunction(runtime)), runtime, jsInvoker);
                args[argIdx] = std::function([weakCbCtx = std::move(weakCbCtx)](std::vector<folly::dynamic> cbArgs) -> void {
                    auto cbCtx = weakCbCtx.lock();
                    if (!cbCtx) {
                        return;
                    }
                    cbCtx->jsInvoker().invokeAsync(
                        [weakCbCtx2 = std::move(weakCbCtx), callbackArgs = std::move(cbArgs)]() {
                            auto cbCtx2 = weakCbCtx2.lock();
                            if (!cbCtx2) {
                                return;
                            }
                            const auto jsArgs = convertDynamicsToJSIValues(cbCtx2->runtime(), callbackArgs);
                            cbCtx2->callback().call(cbCtx2->runtime(), jsArgs.data(), jsArgs.size());
                            cbCtx2->allowRelease();
                        });
                });
                continue;
            }
        }
        args[argIdx] = jsi::dynamicFromValue(runtime, jsiArgs[argIdx]);
    }
    return args;
}

const std::vector<jsi::Value> convertDynamicsToJSIValues(jsi::Runtime &rt, const std::vector<folly::dynamic> &dynamics) {
    std::vector<jsi::Value> values;
    for (auto dynamic : dynamics) {
        values.push_back(jsi::valueFromDynamic(rt, dynamic));
    }
    return values;
}

std::vector<napi_value> convertIntermediaryValuesToNapiValues(ArkJS arkJs, std::vector<IntermediaryArg> args) {
    std::vector<napi_value> napiArgs;
    for (auto arg : args) {
        napiArgs.push_back(convertIntermediaryValueToNapiValue(arkJs, arg));
    }
    return napiArgs;
}

napi_value convertIntermediaryValueToNapiValue(ArkJS arkJs, IntermediaryArg arg) {
    try {
        return arkJs.createFromDynamic(std::get<folly::dynamic>(arg));
    } catch (const std::bad_variant_access &e) {
    }
    try {
        return arkJs.createSingleUseCallback(std::move(std::get<IntermediaryCallback>(arg)));
    } catch (const std::bad_variant_access &e) {
    }
}