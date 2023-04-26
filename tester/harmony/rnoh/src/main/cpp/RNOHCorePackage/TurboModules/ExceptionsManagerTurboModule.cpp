#include "ExceptionsManagerTurboModule.h"
#include "RNOH/ArkTSTurboModule.h"

using namespace rnoh;
using namespace facebook;

rnoh::ExceptionsManagerTurboModule::ExceptionsManagerTurboModule(const ArkTSTurboModule::Context ctx, const std::string name)
    : rnoh::ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(reportFatalException, 3),
        ARK_METHOD_METADATA(reportSoftException, 3),
        ARK_METHOD_METADATA(reportException, 1),
        ARK_METHOD_METADATA(updateExceptionMessage, 3),
        ARK_METHOD_METADATA(dismissRedbox, 0)
    };
}
