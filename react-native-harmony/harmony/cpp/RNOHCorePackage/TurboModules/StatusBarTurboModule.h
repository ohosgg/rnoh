#pragma once

#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT StatusBarTurboModule : public ArkTSTurboModule {
  public:
    StatusBarTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh