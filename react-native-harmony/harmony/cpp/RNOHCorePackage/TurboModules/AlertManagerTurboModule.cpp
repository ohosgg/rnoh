#include "AlertManagerTurboModule.h"
#include "RNOH/ArkTSTurboModule.h"

using namespace facebook;

namespace rnoh {
  AlertManagerTurboModule::AlertManagerTurboModule(const ArkTSTurboModule::Context ctx, const std::string name)
      : ArkTSTurboModule(ctx, name) {
      methodMap_ = {
          ARK_METHOD_METADATA(getConstants, 0),
          ARK_METHOD_METADATA(alert, 3),
      };
  }
}
