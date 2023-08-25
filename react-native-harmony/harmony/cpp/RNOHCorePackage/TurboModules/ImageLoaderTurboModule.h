#pragma once

#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT ImageLoaderTurboModule : public ArkTSTurboModule {
  public:
    ImageLoaderTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh