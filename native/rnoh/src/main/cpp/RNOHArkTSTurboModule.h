#pragma once
#include "napi/native_api.h"
#include "TurboModules/RNOHTurboModule.h"
#include <jsi/jsi.h>
#include "ArkJS.h"
#include "TaskExecutor/TaskExecutor.h"
namespace rnoh {
class RNOHArkTSTurboModule : public RNOHTurboModule {
  public:
    enum MethodReturnType {
        Void
    };
    struct Context : public RNOHTurboModule::Context {
        napi_env env;
        napi_ref arkTsTurboModuleInstanceRef;
        std::shared_ptr<TaskExecutor> taskExecutor;
    };

    RNOHArkTSTurboModule(Context ctx, std::string name);

    facebook::jsi::Value
    invoke(facebook::jsi::Runtime &runtime,
           MethodReturnType returnType,
           const std::string &methodName,
           const facebook::jsi::Value *args,
           size_t argsCount);

  private:
    Context m_ctx;
};
} // namespace rnoh

