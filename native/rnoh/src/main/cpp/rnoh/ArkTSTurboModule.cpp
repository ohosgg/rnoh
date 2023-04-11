#include <jsi/JSIDynamic.h>

#include "rnoh/JsiConversions.h"
#include "rnoh/TaskExecutor.h"
#include "rnoh/ArkTSTurboModule.h"

using namespace rnoh;
using namespace facebook;
using namespace facebook::react;

RNOHArkTSTurboModule::RNOHArkTSTurboModule(Context ctx, std::string name) : m_ctx(ctx), RNOHTurboModule(ctx, name) {}

std::vector<folly::dynamic> convertJSIArgsToDynamic(jsi::Runtime &runtime, const jsi::Value *args, size_t argsCount, std::function<void(jsi::Function)> onFunctionArg) {
    std::vector<folly::dynamic> dynamicArgs(argsCount);
    for (int argIdx = 0; argIdx < argsCount; argIdx++) {
        if (args[argIdx].isObject()) {
            auto obj = args[argIdx].getObject(runtime);
            if (obj.isFunction(runtime)) {
                onFunctionArg(obj.getFunction(runtime));
                continue;
            }
        }
        dynamicArgs[argIdx] = jsi::dynamicFromValue(runtime, args[argIdx]);
    }
    return dynamicArgs;
}

jsi::Value RNOHArkTSTurboModule::call(jsi::Runtime &runtime, const std::string &methodName, const jsi::Value *args, size_t argsCount) {
    folly::dynamic dynamicResult;
    auto dynamicArgs = convertJSIArgsToDynamic(runtime, args, argsCount, [](jsi::Function function) {
        // TODO: handle functions
        LOG(WARNING) << "Function arguments aren't yet supported";
    });
    m_ctx.taskExecutor->runSyncTask(TaskThread::MAIN, [ctx = m_ctx, &methodName, &dynamicArgs, &dynamicResult, argsCount]() {
        ArkJS arkJs(ctx.env);
        auto n_args = arkJs.createFromDynamics(dynamicArgs);
        auto n_result = arkJs.getObject(ctx.arkTsTurboModuleInstanceRef).call(methodName, n_args);
        dynamicResult = arkJs.getDynamic(n_result);
    });
    return jsi::valueFromDynamic(runtime, dynamicResult);
}
