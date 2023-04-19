// NOTE: This entire file should be codegen'ed.

#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT DeviceInfoTurboModule : public ArkTSTurboModule {
  public:
    DeviceInfoTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh