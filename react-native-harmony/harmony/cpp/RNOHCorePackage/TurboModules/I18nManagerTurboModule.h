#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT I18nManagerTurboModule : public ArkTSTurboModule {
  public:
    I18nManagerTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh