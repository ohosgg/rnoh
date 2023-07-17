#include "RNOHCorePackage/TurboModules/DeviceEventManagerTurboModule.h"

namespace rnoh {
using namespace facebook;

DeviceEventManagerTurboModule::DeviceEventManagerTurboModule(const ArkTSTurboModule::Context ctx, const std::string name) : ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(invokeDefaultBackPressHandler, 0),
    };
}

} // namespace rnoh