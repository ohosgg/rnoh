#pragma once
#include "napi/native_api.h"
#include <jsi/jsi.h>
#include <variant>
#include <jsi/JSIDynamic.h>
#include <ReactCommon/CallbackWrapper.h>
#include <ReactCommon/TurboModuleUtils.h>

#include "ArkJS.h"
#include "RNOH/EventDispatcher.h"
#include "RNOH/TurboModule.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"

#define ARK_METHOD_CALLER(name)                                                           \
    [](                                                                                   \
        facebook::jsi::Runtime &rt,                                                       \
        facebook::react::TurboModule &turboModule,                                        \
        const facebook::jsi::Value *args,                                                 \
        size_t count) {                                                                   \
        return static_cast<ArkTSTurboModule &>(turboModule).call(rt, #name, args, count); \
    }

#define ARK_ASYNC_METHOD_CALLER(name)                                                          \
    [](                                                                                        \
        facebook::jsi::Runtime &rt,                                                            \
        facebook::react::TurboModule &turboModule,                                             \
        const facebook::jsi::Value *args,                                                      \
        size_t count) {                                                                        \
        return static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, #name, args, count); \
    }

#define ARK_METHOD_METADATA(name, argc)          \
    {                                            \
        #name, { argc, ARK_METHOD_CALLER(name) } \
    }

#define ARK_ASYNC_METHOD_METADATA(name, argc)          \
    {                                                  \
        #name, { argc, ARK_ASYNC_METHOD_CALLER(name) } \
    }

namespace rnoh {

class ArkTSTurboModule : public TurboModule {
  public:
    struct Context : public TurboModule::Context {
        napi_env env;
        napi_ref arkTsTurboModuleInstanceRef;
        std::shared_ptr<TaskExecutor> taskExecutor;
        std::shared_ptr<EventDispatcher> eventDispatcher;
    };

    ArkTSTurboModule(Context ctx, std::string name);

    facebook::jsi::Value call(facebook::jsi::Runtime &runtime,
                              const std::string &methodName,
                              const facebook::jsi::Value *args,
                              size_t argsCount);

    void scheduleCall(facebook::jsi::Runtime &runtime,
                      const std::string &methodName,
                      const facebook::jsi::Value *args,
                      size_t argsCount);

    facebook::jsi::Value callAsync(facebook::jsi::Runtime &runtime,
                                   const std::string &methodName,
                                   const facebook::jsi::Value *args,
                                   size_t argsCount);

  protected:
    Context m_ctx;
};
} // namespace rnoh
