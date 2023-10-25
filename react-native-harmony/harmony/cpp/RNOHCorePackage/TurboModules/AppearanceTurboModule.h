#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT AppearanceTurboModule : public ArkTSTurboModule {
  public:
    AppearanceTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh