#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT SourceCodeTurboModule : public ArkTSTurboModule {
  public:
    SourceCodeTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh
