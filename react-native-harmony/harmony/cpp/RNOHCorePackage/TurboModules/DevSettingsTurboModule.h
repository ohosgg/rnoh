#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT DevSettingsTurboModule : public ArkTSTurboModule {
  public:
    DevSettingsTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh