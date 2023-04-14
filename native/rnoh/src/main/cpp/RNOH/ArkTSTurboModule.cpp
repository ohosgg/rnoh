#include <variant>
#include <jsi/JSIDynamic.h>
#include <ReactCommon/CallbackWrapper.h>
#include <ReactCommon/TurboModuleUtils.h>

#include "RNOH/JsiConversions.h"
#include "RNOH/TaskExecutor.h"
#include "RNOH/ArkTSTurboModule.h"
#include "ArkTSTurboModule.h"

using namespace rnoh;
using namespace facebook;

using IntermediaryCallback = std::function<void(std::vector<folly::dynamic>)>;
using IntermediaryArg = std::variant<folly::dynamic, IntermediaryCallback>;

std::vector<IntermediaryArg> convertJSIValuesToIntermediaryValues(jsi::Runtime &runtime, std::shared_ptr<react::CallInvoker> jsInvoker, const jsi::Value *jsiArgs, size_t argsCount);
IntermediaryCallback createIntermediaryCallback(std::weak_ptr<react::CallbackWrapper>);
const std::vector<jsi::Value> convertDynamicsToJSIValues(jsi::Runtime &rt, const std::vector<folly::dynamic> &dynamics);
napi_value convertIntermediaryValueToNapiValue(ArkJS arkJs, IntermediaryArg arg);
std::vector<napi_value> convertIntermediaryValuesToNapiValues(ArkJS arkJs, std::vector<IntermediaryArg> args);
jsi::Value preparePromiseResolverResult(jsi::Runtime &rt, const std::vector<folly::dynamic> args);
std::string preparePromiseRejectionResult(const std::vector<folly::dynamic> args);

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

jsi::Value ArkTSTurboModule::callAsync(jsi::Runtime &runtime, const std::string &methodName, const jsi::Value *jsiArgs, size_t argsCount) {
    auto args = convertJSIValuesToIntermediaryValues(runtime, m_ctx.jsInvoker, jsiArgs, argsCount);
    napi_value napiResult;
    m_ctx.taskExecutor->runSyncTask(TaskThread::MAIN, [ctx = m_ctx, &methodName, &args, &runtime, &napiResult]() {
        ArkJS arkJs(ctx.env);
        auto napiArgs = convertIntermediaryValuesToNapiValues(arkJs, args);
        auto napiTurboModuleObject = arkJs.getObject(ctx.arkTsTurboModuleInstanceRef);
        napiResult = napiTurboModuleObject.call(methodName, napiArgs);
    });
    return react::createPromiseAsJSIValue(
        runtime, [ctx = m_ctx, napiResult](jsi::Runtime &rt2, std::shared_ptr<react::Promise> jsiPromise) {
            ctx.taskExecutor->runTask(TaskThread::MAIN, [ctx, napiResult, &rt2, jsiPromise]() {
                Promise(ctx.env, napiResult)
                    .then([&rt2, jsiPromise, ctx](auto args) {
                        ctx.jsInvoker->invokeAsync([&rt2, jsiPromise, args = std::move(args)]() {
                            jsiPromise->resolve(preparePromiseResolverResult(rt2, args));
                            jsiPromise->allowRelease();
                        });
                    })
                    .catch_([&rt2, jsiPromise, ctx](auto args) {
                        ctx.jsInvoker->invokeAsync([&rt2, jsiPromise, args]() {
                            jsiPromise->reject(preparePromiseRejectionResult(args));
                            jsiPromise->allowRelease();
                        });
                    });
            });
        });
}

std::vector<IntermediaryArg> convertJSIValuesToIntermediaryValues(jsi::Runtime &runtime, std::shared_ptr<react::CallInvoker> jsInvoker, const jsi::Value *jsiArgs, size_t argsCount) {
    std::vector<IntermediaryArg> args(argsCount);
    for (int argIdx = 0; argIdx < argsCount; argIdx++) {
        if (jsiArgs[argIdx].isObject()) {
            auto obj = jsiArgs[argIdx].getObject(runtime);
            if (obj.isFunction(runtime)) {
                args[argIdx] = createIntermediaryCallback(react::CallbackWrapper::createWeak(std::move(obj.getFunction(runtime)), runtime, jsInvoker));
                continue;
            }
        }
        args[argIdx] = jsi::dynamicFromValue(runtime, jsiArgs[argIdx]);
    }
    return args;
}

IntermediaryCallback createIntermediaryCallback(std::weak_ptr<react::CallbackWrapper> weakCbCtx) {
    return std::function([weakCbCtx = std::move(weakCbCtx)](std::vector<folly::dynamic> cbArgs) -> void {
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

jsi::Value preparePromiseResolverResult(jsi::Runtime &rt, const std::vector<folly::dynamic> args) {
    if (args.size() == 0) {
        return jsi::Value::undefined();
    }
    if (args.size() > 1) {
        throw std::invalid_argument("`resolve` accepts only one argument");
    }
    return jsi::valueFromDynamic(rt, args[0]);
}

std::string preparePromiseRejectionResult(const std::vector<folly::dynamic> args) {
    if (args.size() == 0) {
        return "";
    }
    if (args.size() > 1) {
        throw std::invalid_argument("`reject` accepts only one argument");
    }
    if (!args[0].isString()) {
        throw std::invalid_argument("The type of argument provided `reject` must be string. It's going to be used as an error message");
    }
    return args[0].getString();
}