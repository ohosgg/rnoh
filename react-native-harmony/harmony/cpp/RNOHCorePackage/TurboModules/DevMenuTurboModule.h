#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT DevMenuTurboModule : public ArkTSTurboModule {
  public:
    DevMenuTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh