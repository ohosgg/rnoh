#include "RNOHCorePackage/TurboModules/DevSettingsTurboModule.h"

using namespace facebook;

namespace rnoh {
DevSettingsTurboModule::DevSettingsTurboModule(const ArkTSTurboModule::Context ctx, const std::string name)
    : ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(reload, 0),
        ARK_METHOD_METADATA(reloadWithReason, 1),
        ARK_METHOD_METADATA(onFastRefresh, 0),
        ARK_METHOD_METADATA(setHotLoadingEnabled, 1),
        ARK_METHOD_METADATA(setIsDebuggingRemotely, 1),
        ARK_METHOD_METADATA(setProfilingEnabled, 1),
        ARK_METHOD_METADATA(toggleElementInspector, 0),
        ARK_METHOD_METADATA(addMenuItem, 1),
        ARK_METHOD_METADATA(addListener, 1),
        ARK_METHOD_METADATA(removeListeners, 1),
        ARK_METHOD_METADATA(setIsShakeToShowDevMenuEnabled, 1),
    };
}
} // namespace rnoh
