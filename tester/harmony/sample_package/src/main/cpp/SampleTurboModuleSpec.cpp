// NOTE: This entire file should be codegen'ed.

#include "SampleTurboModuleSpec.h"

using namespace rnoh;
using namespace facebook;

static jsi::Value __hostFunction_NativeSampleTurboModuleSpecJSI_voidFunc(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return static_cast<ArkTSTurboModule &>(turboModule).call(rt, "voidFunc", args, count);
}

static jsi::Value __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getBool(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return jsi::Value(static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getBool", args, count));
}

static jsi::Value __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getNull(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return jsi::Value(static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getNull", args, count));
}

static jsi::Value __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getString(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return jsi::Value(static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getString", args, count));
}

static jsi::Value __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getObject(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return jsi::Value(static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getObject", args, count));
}

static jsi::Value __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getArray(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return jsi::Value(static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getArray", args, count));
}

static jsi::Value __hostFunction_NativeSampleTurboCxxModuleSpecJSI_registerFunction(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return jsi::Value(static_cast<ArkTSTurboModule &>(turboModule).call(rt, "registerFunction", args, count));
}

static jsi::Value __hostFunction_NativeSampleTurboCxxModuleSpecJSI_doAsyncJob(
    jsi::Runtime &rt,
    react::TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
    return jsi::Value(static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "doAsyncJob", args, count));
}

static jsi::Value __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getPromisedArray(jsi::Runtime &rt,
                                                                              react::TurboModule &turboModule,
                                                                              const jsi::Value *args, size_t count) {
    return jsi::Value(static_cast<ArkTSTurboModule &>(turboModule).callAsync(rt, "getPromisedArray", args, count));
}

NativeSampleTurboModuleSpecJSI::NativeSampleTurboModuleSpecJSI(const ArkTSTurboModule::Context ctx, const std::string name)
    : ArkTSTurboModule(ctx, name) {
    methodMap_["voidFunc"] = MethodMetadata{0, __hostFunction_NativeSampleTurboModuleSpecJSI_voidFunc};
    methodMap_["getBool"] = MethodMetadata{1, __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getBool};
    methodMap_["getNull"] = MethodMetadata{1, __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getNull};
    methodMap_["getArray"] = MethodMetadata{1, __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getArray};
    methodMap_["getString"] = MethodMetadata{1, __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getString};
    methodMap_["getObject"] = MethodMetadata{1, __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getObject};
    methodMap_["registerFunction"] = MethodMetadata{1, __hostFunction_NativeSampleTurboCxxModuleSpecJSI_registerFunction};
    methodMap_["getPromisedArray"] = MethodMetadata{0, __hostFunction_NativeSampleTurboCxxModuleSpecJSI_getPromisedArray};
    methodMap_["doAsyncJob"] = MethodMetadata{0, __hostFunction_NativeSampleTurboCxxModuleSpecJSI_doAsyncJob};
}