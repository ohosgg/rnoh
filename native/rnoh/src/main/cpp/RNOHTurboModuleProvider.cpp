#include "RNOHTurboModuleProvider.h"
#include <ReactCommon/TurboModuleBinding.h>
#include <ReactCommon/LongLivedObject.h>
#include "RNOHLogSink.h"

using namespace rnoh;
using namespace facebook::react;

RNOHTurboModuleProvider::RNOHTurboModuleProvider(std::shared_ptr<CallInvoker> jsInvoker,
                                                 RNOHTurboModuleFactory &&turboModuleFactory)
    : m_jsInvoker(jsInvoker),
      m_createTurboModule([factory = std::move(turboModuleFactory)](std::string const &moduleName,
                                                                    std::shared_ptr<CallInvoker> jsInvoker) -> std::shared_ptr<TurboModule> {
          return factory.create(RNOHTurboModuleFactory::Context{.jsInvoker = jsInvoker}, moduleName);
      }) {}

void RNOHTurboModuleProvider::installJSBindings(RuntimeExecutor runtimeExecutor) {
    if (!runtimeExecutor) {
        LOG(ERROR) << "Turbo Modules couldn't be installed. Invalid RuntimeExecutor.";
        return;
    }
    auto turboModuleProvider = [self = this->shared_from_this()](std::string const &moduleName) {
        auto turboModule = self->getTurboModule(moduleName);
        return turboModule;
    };
    runtimeExecutor(
        [turboModuleProvider = std::move(turboModuleProvider)](facebook::jsi::Runtime &runtime) {
            TurboModuleBinding::install(runtime,
                                        std::move(turboModuleProvider),
                                        TurboModuleBindingMode::HostObject,
                                        nullptr);
        });
}

std::shared_ptr<TurboModule> RNOHTurboModuleProvider::getTurboModule(std::string const &moduleName) {
    if (m_cache.contains(moduleName)) {
        LOG(INFO) << "Cache hit. Providing '" << moduleName << "' Turbo Module";
        return m_cache[moduleName];
    }
    auto turboModule = m_createTurboModule(moduleName, m_jsInvoker);
    if (turboModule != nullptr) {
        m_cache[moduleName] = turboModule;
        return turboModule;
    }
    LOG(ERROR) << "Couldn't provide turbo module \" " << moduleName << "\"";
    return nullptr;
}