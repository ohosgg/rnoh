// NOTE: This entire file shoule be codegen'ed.
#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"
#include <react/bridging/Bridging.h>

using namespace rnoh;
using namespace facebook;

struct ConstantsStruct {
    bool const1;
    int32_t const2;
    std::string const3;
    bool operator==(const ConstantsStruct &other) const {
        return const1 == other.const1 && const2 == other.const2 && const3 == other.const3;
    }
};

class JSI_EXPORT NativeCxxModuleExampleCxxSpecJSI : public ArkTSTurboModule {
public:
    NativeCxxModuleExampleCxxSpecJSI(const ArkTSTurboModule::Context ctx, const std::string name);

    bool getBool(jsi::Runtime &rt, bool arg);

    int32_t getEnum(jsi::Runtime &rt, int32_t arg);

    double getNumber(jsi::Runtime &rt, double arg);

    void voidFunc(jsi::Runtime &rt);
};