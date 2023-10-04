#include "SafeAreaTurboModule.h"

namespace rnoh {
using namespace facebook;

SafeAreaTurboModule::SafeAreaTurboModule(const ArkTSTurboModule::Context ctx, const std::string name) : ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(getInitialInsets, 0),
    };
}

} // namespace rnoh