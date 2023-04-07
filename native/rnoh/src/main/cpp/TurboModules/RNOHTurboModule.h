#pragma once

#include <ReactCommon/TurboModule.h>
#include <memory>

#include "glog/logging.h"

namespace rnoh {

class RNOHTurboModule : public facebook::react::TurboModule {
  public:
    struct Context {
        std::shared_ptr<facebook::react::CallInvoker> jsInvoker;
    };

    RNOHTurboModule(Context ctx, std::string name)
        : facebook::react::TurboModule(name, ctx.jsInvoker) {
    }

    void set(facebook::jsi::Runtime &rt, const facebook::jsi::PropNameID &name, const facebook::jsi::Value &value) override {
        LOG(INFO) << "Turbo Module: " << name_ << "::"
                  << "set("
                  << "_, \"" << name.utf8(rt) << "\", \"" << value.toString(rt).utf8(rt) << "\")";
    }
};

} // namespace rnoh