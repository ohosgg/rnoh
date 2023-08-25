#include "ImageLoaderTurboModule.h"
#include "RNOH/ArkTSTurboModule.h"

using namespace rnoh;
using namespace facebook;

rnoh::ImageLoaderTurboModule::ImageLoaderTurboModule(const ArkTSTurboModule::Context ctx, const std::string name)
    : rnoh::ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(getConstants, 0),
        ARK_ASYNC_METHOD_METADATA(getSize, 1),
        ARK_ASYNC_METHOD_METADATA(getSizeWithHeaders, 2),
        ARK_ASYNC_METHOD_METADATA(prefetchImage, 1),
        ARK_ASYNC_METHOD_METADATA(prefetchImageWithMetadata, 3),
        ARK_ASYNC_METHOD_METADATA(queryCache, 1)};
}
