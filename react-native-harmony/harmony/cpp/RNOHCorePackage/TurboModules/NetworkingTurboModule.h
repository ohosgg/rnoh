#pragma once

#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT NetworkingTurboModule : public ArkTSTurboModule {
  public:
    NetworkingTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh