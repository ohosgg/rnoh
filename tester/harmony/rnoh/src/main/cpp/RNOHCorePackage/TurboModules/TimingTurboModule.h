#pragma once

#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT TimingTurboModule : public ArkTSTurboModule {
  public:
    TimingTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh