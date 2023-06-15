#include "StatusBarTurboModule.h"

namespace rnoh {
using namespace facebook;

StatusBarTurboModule::StatusBarTurboModule(const ArkTSTurboModule::Context ctx, const std::string name) : ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(getConstants, 0),
        ARK_METHOD_METADATA(setColor, 1),
        ARK_METHOD_METADATA(setHidden, 1),
        ARK_METHOD_METADATA(setStyle, 1),
        ARK_METHOD_METADATA(setTranslucent, 1),
    };
}

} // namespace rnoh