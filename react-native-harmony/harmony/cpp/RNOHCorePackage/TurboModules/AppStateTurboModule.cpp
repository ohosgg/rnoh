#include "RNOHCorePackage/TurboModules/AppStateTurboModule.h"

namespace rnoh {
using namespace facebook;

AppStateTurboModule::AppStateTurboModule(const ArkTSTurboModule::Context ctx, const std::string name) : ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(getCurrentAppState, 0),
        ARK_METHOD_METADATA(getConstants, 0),
    };
}

} // namespace rnoh