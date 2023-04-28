#pragma once

#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT WebSocketTurboModule : public ArkTSTurboModule {

public:
    WebSocketTurboModule(const ArkTSTurboModule::Context ctx, const std::string name);

};

} // namespace rnoh
