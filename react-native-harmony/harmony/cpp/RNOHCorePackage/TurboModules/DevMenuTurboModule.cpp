#include "RNOHCorePackage/TurboModules/DevMenuTurboModule.h"

using namespace facebook;

namespace rnoh {
DevMenuTurboModule::DevMenuTurboModule(const ArkTSTurboModule::Context ctx, const std::string name)
    : ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(show, 0),
        ARK_METHOD_METADATA(reload, 1),
        ARK_METHOD_METADATA(debugRemotely, 1),
        ARK_METHOD_METADATA(setProfilingEnabled, 1),
        ARK_METHOD_METADATA(setHotLoadingEnabled, 1),
    };
}
} // namespace rnoh
