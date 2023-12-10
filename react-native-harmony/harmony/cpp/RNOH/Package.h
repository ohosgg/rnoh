#pragma once
#include <react/renderer/componentregistry/ComponentDescriptorProvider.h>
#include "RNOH/TurboModule.h"
#include "RNOH/ShadowViewRegistry.h"
#include "RNOH/TurboModuleFactory.h"
#include "RNOH/UIManagerModule.h"
#include "RNOH/MutationsToNapiConverter.h"
#include "RNOH/EventEmitRequestHandler.h"

namespace rnoh {

class Package {
  public:
    struct Context {
      ShadowViewRegistry::Shared shadowViewRegistry;
    };

    Package(Context ctx);
    virtual ~Package(){};

    virtual std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate();

    virtual std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders();

    virtual ComponentJSIBinderByString createComponentJSIBinderByName();

    virtual ComponentNapiBinderByString createComponentNapiBinderByName();

    virtual EventEmitRequestHandlers createEventEmitRequestHandlers();

  protected:
    Context m_ctx;
};
} // namespace rnoh