#include "NetworkingTurboModule.h"

namespace rnoh {

using namespace facebook;

static jsi::Value __hostFunction_NetworkingTurboModule_sendRequest(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).call(rt, "sendRequest", args, count);
}

static jsi::Value __hostFunction_NetworkingTurboModule_abortRequest(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).call(rt, "abortRequest", args, count);
}

NetworkingTurboModule::NetworkingTurboModule(const ArkTSTurboModule::Context ctx, const std::string name) 
    : ArkTSTurboModule(ctx, name) 
{
    methodMap_ = {
        {"sendRequest", {2, __hostFunction_NetworkingTurboModule_sendRequest}},
        {"abortRequest", {1, __hostFunction_NetworkingTurboModule_abortRequest}}
    };
}

} // namespace rnoh
