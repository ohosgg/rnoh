#include <variant>
#include <jsi/JSIDynamic.h>
#include <ReactCommon/CallbackWrapper.h>
#include <ReactCommon/TurboModuleUtils.h>

#include "RNOH/JsiConversions.h"
#include "RNOH/ArkTSTurboModule.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"
#include "ArkTSTurboModule.h"

using namespace rnoh;
using namespace facebook;

using IntermediaryArg = ArkJS::IntermediaryArg;
using IntermediaryCallback = ArkJS::IntermediaryCallback;

std::vector<IntermediaryArg> convertJSIValuesToIntermediaryValues(facebook::jsi::Runtime &runtime, std::shared_ptr<facebook::react::CallInvoker> jsInvoker, const facebook::jsi::Value *jsiArgs, size_t argsCount);
IntermediaryCallback createIntermediaryCallback(std::weak_ptr<facebook::react::CallbackWrapper>);
const std::vector<facebook::jsi::Value> convertDynamicsToJSIValues(facebook::jsi::Runtime &rt, const std::vector<folly::dynamic> &dynamics);
facebook::jsi::Value preparePromiseResolverResult(facebook::jsi::Runtime &rt, const std::vector<folly::dynamic> args);
std::string preparePromiseRejectionResult(const std::vector<folly::dynamic> args);

ArkTSTurboModule::ArkTSTurboModule(Context ctx, std::string name) : m_ctx(ctx), TurboModule(ctx, name) {}

jsi::Value ArkTSTurboModule::call(jsi::Runtime &runtime, const std::string &methodName, const jsi::Value *jsiArgs, size_t argsCount) {
    folly::dynamic result;
    auto args = convertJSIValuesToIntermediaryValues(runtime, m_ctx.jsInvoker, jsiArgs, argsCount);
    m_ctx.taskExecutor->runSyncTask(TaskThread::MAIN, [ctx = m_ctx, &methodName, &args, &result, &runtime]() {
        ArkJS arkJs(ctx.env);
        auto napiArgs = arkJs.convertIntermediaryValuesToNapiValues(args);
        auto napiTurboModuleObject = arkJs.getObject(ctx.arkTsTurboModuleInstanceRef);
        auto napiResult = napiTurboModuleObject.call(methodName, napiArgs);
        result = arkJs.getDynamic(napiResult);
    });
    return jsi::valueFromDynamic(runtime, result);
}

jsi::Value ArkTSTurboModule::callAsync(jsi::Runtime &runtime, const std::string &methodName, const jsi::Value *jsiArgs, size_t argsCount) {
    auto args = convertJSIValuesToIntermediaryValues(runtime, m_ctx.jsInvoker, jsiArgs, argsCount);
    napi_ref napiResultRef;
    m_ctx.taskExecutor->runSyncTask(TaskThread::MAIN, [ctx = m_ctx, &methodName, &args, &runtime, &napiResultRef]() {
        ArkJS arkJs(ctx.env);
        auto napiArgs = arkJs.convertIntermediaryValuesToNapiValues(args);
        auto napiTurboModuleObject = arkJs.getObject(ctx.arkTsTurboModuleInstanceRef);
        auto napiResult = napiTurboModuleObject.call(methodName, napiArgs);
        napiResultRef = arkJs.createReference(napiResult);
    });
    return react::createPromiseAsJSIValue(
        runtime, [ctx = m_ctx, napiResultRef](jsi::Runtime &rt2, std::shared_ptr<react::Promise> jsiPromise) {
            ctx.taskExecutor->runTask(TaskThread::MAIN, [ctx, napiResultRef, &rt2, jsiPromise]() {
                ArkJS arkJs(ctx.env);
                auto napiResult = arkJs.getReferenceValue(napiResultRef);
                Promise(ctx.env, napiResult)
                    .then([&rt2, jsiPromise, ctx, napiResultRef](auto args) {
                        ctx.jsInvoker->invokeAsync([&rt2, jsiPromise, args = std::move(args)]() {
                            jsiPromise->resolve(preparePromiseResolverResult(rt2, args));
                            jsiPromise->allowRelease();
                        });
                        ArkJS arkJs(ctx.env);
                        arkJs.deleteReference(napiResultRef);
                    })
                    .catch_([&rt2, jsiPromise, ctx, napiResultRef](auto args) {
                        ctx.jsInvoker->invokeAsync([&rt2, jsiPromise, args]() {
                            jsiPromise->reject(preparePromiseRejectionResult(args));
                            jsiPromise->allowRelease();
                        });
                        ArkJS arkJs(ctx.env);
                        arkJs.deleteReference(napiResultRef);
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