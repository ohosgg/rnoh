#pragma once

#include <ReactCommon/TurboModule.h>
#include <memory>

#include "glog/logging.h"

namespace rnoh {

class RNOHTurboModule : public facebook::react::TurboModule {

  public:
    RNOHTurboModule(std::string name, std::shared_ptr<facebook::react::CallInvoker> jsInvoker)
        : facebook::react::TurboModule(name, jsInvoker) {
    }

    void set(facebook::jsi::Runtime &rt, const facebook::jsi::PropNameID &name, const facebook::jsi::Value &value) override {
        LOG(INFO) << "Turbo Module: " << name_ << "::"
                  << "set("
                  << "_, \"" << name.utf8(rt) << "\", \"" << value.toString(rt).utf8(rt) << "\")";
    }
};

} // namespace rnoh