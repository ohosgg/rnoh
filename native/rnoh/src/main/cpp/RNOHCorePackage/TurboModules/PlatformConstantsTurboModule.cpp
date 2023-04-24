#include "RNOHCorePackage/TurboModules/PlatformConstantsTurboModule.h"

using namespace rnoh;
using namespace facebook;

static jsi::Value __hostFunction_PlatformConstantsTurboModule_getConstants(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getConstants", args, count);
}

PlatformConstantsTurboModule::PlatformConstantsTurboModule(const ArkTSTurboModule::Context ctx, const std::string name)
    : ArkTSTurboModule(ctx, name) {
    methodMap_["getConstants"] = MethodMetadata{0, __hostFunction_PlatformConstantsTurboModule_getConstants};
}