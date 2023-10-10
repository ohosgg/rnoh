#include "LinkingManagerTurboModule.h"

namespace rnoh {
using namespace facebook;

LinkingManagerTurboModule::LinkingManagerTurboModule(
    const ArkTSTurboModule::Context ctx, const std::string name) : ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(getInitialURL, 0),
        ARK_ASYNC_METHOD_METADATA(canOpenURL, 1),
        ARK_ASYNC_METHOD_METADATA(openURL, 1),
        ARK_ASYNC_METHOD_METADATA(openSettings, 0)
    };
}

} // namespace rnoh