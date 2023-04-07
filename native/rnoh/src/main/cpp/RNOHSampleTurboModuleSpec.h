// NOTE: This entire file should be codegen'ed.

#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOHArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT NativeSampleTurboModuleSpecJSI : public RNOHArkTSTurboModule {
  public:
    NativeSampleTurboModuleSpecJSI(const RNOHArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh
