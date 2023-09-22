#pragma once

#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT LinkingManagerTurboModule : public ArkTSTurboModule {
  public:
    LinkingManagerTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh