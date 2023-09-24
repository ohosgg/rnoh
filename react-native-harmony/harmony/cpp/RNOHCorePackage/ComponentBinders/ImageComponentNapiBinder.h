#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include <react/renderer/components/image/ImageProps.h>

namespace rnoh {

class ImageComponentNapiBinder : public ViewComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiViewProps = ViewComponentNapiBinder::createProps(env, shadowView);
        if (auto props = std::dynamic_pointer_cast<const facebook::react::ImageProps>(shadowView.props)) {
            facebook::react::ImageSource imageSource;
            if (props->sources.size() > 0) {
                imageSource = props->sources[0];
                return ArkJS(env)
                    .getObjectBuilder(napiViewProps)
                    .addProperty("uri", imageSource.uri)
                    .addProperty("resizeMode", static_cast<int>(props->resizeMode))
                    .addProperty("tintColor", props->tintColor)
                    .addProperty("blurRadius", props->blurRadius)
                    .build();
            }
        }
        return napiViewProps;
    };
};

} // namespace rnoh
