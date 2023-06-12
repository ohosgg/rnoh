#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT AppStateTurboModule : public ArkTSTurboModule {
  public:
    AppStateTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh