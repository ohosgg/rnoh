#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT PlatformConstantsTurboModule : public ArkTSTurboModule {
  public:
    PlatformConstantsTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh
