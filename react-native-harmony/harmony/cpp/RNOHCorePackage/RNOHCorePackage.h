#pragma once
#include <react/renderer/components/view/ViewComponentDescriptor.h>
#include <react/renderer/components/image/ImageComponentDescriptor.h>
#include <react/renderer/components/text/TextComponentDescriptor.h>
#include <react/renderer/components/text/RawTextComponentDescriptor.h>
#include <react/renderer/components/text/ParagraphComponentDescriptor.h>
#include <react/renderer/components/textinput/TextInputComponentDescriptor.h>
#include <react/renderer/components/scrollview/ScrollViewComponentDescriptor.h>
#include "RNOH/Package.h"
#include "RNOHCorePackage/TurboModules/AppStateTurboModule.h"
#include "RNOHCorePackage/TurboModules/DeviceInfoTurboModule.h"
#include "RNOHCorePackage/TurboModules/ExceptionsManagerTurboModule.h"
#include "RNOHCorePackage/TurboModules/NetworkingTurboModule.h"
#include "RNOHCorePackage/TurboModules/PlatformConstantsTurboModule.h"
#include "RNOHCorePackage/TurboModules/SourceCodeTurboModule.h"
#include "RNOHCorePackage/TurboModules/StatusBarTurboModule.h"
#include "RNOHCorePackage/TurboModules/TimingTurboModule.h"
#include "RNOHCorePackage/TurboModules/WebSocketTurboModule.h"
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include "RNOHCorePackage/ComponentBinders/ImageComponentJSIBinder.h"
#include "RNOHCorePackage/ComponentBinders/ImageComponentNapiBinder.h"
#include "RNOHCorePackage/ComponentBinders/ScrollViewComponentJSIBinder.h"
#include "RNOHCorePackage/ComponentBinders/ScrollViewComponentNapiBinder.h"
#include "RNOHCorePackage/ComponentBinders/TextComponentNapiBinder.h"
#include "RNOHCorePackage/ComponentBinders/TextInputComponentNapiBinder.h"
#include "RNOHCorePackage/EventEmitRequestHandlers/TouchEventEmitRequestHandler.h"
#include "RNOHCorePackage/EventEmitRequestHandlers/TextInputChangeEventEmitRequestHandler.h"
#include "RNOHCorePackage/EventEmitRequestHandlers/ScrollEventEmitRequestHandler.h"
#include "RNOHCorePackage/TurboModules/Animated/NativeAnimatedTurboModule.h"

namespace rnoh {

class RNOHCoreTurboModuleFactoryDelegate : public TurboModuleFactoryDelegate {
  public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
        if (name == "AppState") {
            return std::make_shared<AppStateTurboModule>(ctx, name);
        } else if (name == "DeviceInfo") {
            return std::make_shared<DeviceInfoTurboModule>(ctx, name);
        } else if (name == "ExceptionsManager") {
            return std::make_shared<ExceptionsManagerTurboModule>(ctx, name);
        } else if (name == "NativeAnimatedTurboModule") {
            return std::make_shared<NativeAnimatedTurboModule>(ctx, name);
        } else if (name == "Networking") {
            return std::make_shared<NetworkingTurboModule>(ctx, name);
        } else if (name == "PlatformConstants") {
            return std::make_shared<PlatformConstantsTurboModule>(ctx, name);
        } else if (name == "SourceCode") {
            return std::make_shared<SourceCodeTurboModule>(ctx, name);
        } else if (name == "StatusBarManager") {
            return std::make_shared<StatusBarTurboModule>(ctx, name);
        } else if (name == "Timing") {
            return std::make_shared<TimingTurboModule>(ctx, name);
        } else if (name == "WebSocketModule") {
            return std::make_shared<WebSocketTurboModule>(ctx, name);
        }
        return nullptr;
    };
};

class RNOHCorePackage : public Package {
  public:
    RNOHCorePackage(Package::Context ctx) : Package(ctx){};

    std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override {
        return std::make_unique<RNOHCoreTurboModuleFactoryDelegate>();
    }

    std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders() override {
        return {
            facebook::react::concreteComponentDescriptorProvider<facebook::react::ViewComponentDescriptor>(),
            facebook::react::concreteComponentDescriptorProvider<facebook::react::ImageComponentDescriptor>(),
            facebook::react::concreteComponentDescriptorProvider<facebook::react::TextComponentDescriptor>(),
            facebook::react::concreteComponentDescriptorProvider<facebook::react::RawTextComponentDescriptor>(),
            facebook::react::concreteComponentDescriptorProvider<facebook::react::ParagraphComponentDescriptor>(),
            facebook::react::concreteComponentDescriptorProvider<facebook::react::TextInputComponentDescriptor>(),
            facebook::react::concreteComponentDescriptorProvider<facebook::react::ScrollViewComponentDescriptor>(),
        };
    }

    ComponentJSIBinderByString createComponentJSIBinderByName() override {
        return {
            {"RCTView", std::make_shared<ViewComponentJSIBinder>()},
            {"RCTImageView", std::make_shared<ImageComponentJSIBinder>()},
            {"RCTVirtualText", std::make_shared<ViewComponentJSIBinder>()},
            {"RCTSinglelineTextInputView", std::make_shared<ViewComponentJSIBinder>()},
            {"RCTScrollView", std::make_shared<ScrollViewComponentJSIBinder>()},
            {"RCTScrollContentView", std::make_shared<ViewComponentJSIBinder>()}};
    };

    ComponentNapiBinderByString createComponentNapiBinderByName() override {
        return {
            {"RootView", std::make_shared<ViewComponentNapiBinder>()},
            {"View", std::make_shared<ViewComponentNapiBinder>()},
            {"Image", std::make_shared<ImageComponentNapiBinder>()},
            {"Paragraph", std::make_shared<TextComponentNapiBinder>()},
            {"ScrollView", std::make_shared<ScrollViewComponentNapiBinder>()},
            {"TextInput", std::make_shared<TextInputComponentNapiBinder>()}};
    };

    EventEmitRequestHandlerByString createEventEmitRequestHandlerByName() override {
        return {{"Touch", std::make_shared<TouchEventEmitRequestHandler>()},
                {"TextInputChange", std::make_shared<TextInputChangeEventEmitRequestHandler>()},
                {"Scroll", std::make_shared<ScrollEventEmitRequestHandler>()}};
    }
};

} // namespace rnoh