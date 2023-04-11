#include "RNOHArkTSTurboModule.h"
#include "TaskExecutor/TaskExecutor.h"
using namespace rnoh;
using namespace facebook::jsi;
using namespace facebook::react;

RNOHArkTSTurboModule::RNOHArkTSTurboModule(Context ctx, std::string name) : m_ctx(ctx), RNOHTurboModule(ctx, name) {}

Value RNOHArkTSTurboModule::invoke(Runtime &runtime, MethodReturnType returnType, const std::string &methodName, const Value *args, size_t argsCount) {
    m_ctx.taskExecutor->runSyncTask(TaskThread::MAIN, [ctx = m_ctx, methodName]() {
        ArkJS arkJs(ctx.env);
        arkJs.getObject(ctx.arkTsTurboModuleInstanceRef).call(methodName, {});
    });
    return Value::undefined();
}