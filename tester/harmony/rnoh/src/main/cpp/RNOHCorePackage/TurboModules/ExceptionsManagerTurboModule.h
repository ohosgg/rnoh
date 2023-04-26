#pragma once

#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT ExceptionsManagerTurboModule : public ArkTSTurboModule {
public:
    ExceptionsManagerTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

} // namespace rnoh