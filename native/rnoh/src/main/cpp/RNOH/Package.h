#pragma once
#include "RNOH/TurboModule.h"
#include "RNOH/TurboModuleFactory.h"

namespace rnoh {

class Package {
  public:
    struct Context {};

    Package(Context ctx);
    virtual ~Package() {};

    virtual std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactory() = 0;


  protected:
    Context m_ctx;
};
} // namespace rnoh