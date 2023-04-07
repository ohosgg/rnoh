// NOTE: This entire file should be codegen'ed.

#include "RNOHSampleTurboModuleSpec.h"
#include "hilog/log.h"

using namespace rnoh;
using namespace facebook;

static jsi::Value __hostFunction_NativeSampleTurboModuleSpecJSI_voidFunc(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return static_cast<RNOHArkTSTurboModule &>(turboModule).invoke(rt, RNOHArkTSTurboModule::MethodReturnType::Void, "voidFunc", args, count);
}

NativeSampleTurboModuleSpecJSI::NativeSampleTurboModuleSpecJSI(const RNOHArkTSTurboModule::Context ctx, const std::string name)
    : RNOHArkTSTurboModule(ctx, name) {
    methodMap_["voidFunc"] = MethodMetadata{0, __hostFunction_NativeSampleTurboModuleSpecJSI_voidFunc};
}