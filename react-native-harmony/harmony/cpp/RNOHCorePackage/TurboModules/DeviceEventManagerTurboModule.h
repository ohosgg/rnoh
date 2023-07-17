#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT DeviceEventManagerTurboModule : public ArkTSTurboModule {
  public:
    DeviceEventManagerTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh