#pragma once
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include "RNOH/TurboModule.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOH/UIManagerModule.h"
#include "RNOH/MutationsToNapiConverter.h"

namespace rnoh {

class Package {
  public:
    struct Context {};

    Package(Context ctx);
    virtual ~Package(){};

    virtual std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate();

    virtual std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders();

    virtual ComponentJSIBinderByString createComponentJSIBinderByName();

    virtual ComponentNapiBinderByString createComponentNapiBinderByName();

  protected:
    Context m_ctx;
};
} // namespace rnoh