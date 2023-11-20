#pragma once
#include <string>
#include <folly/dynamic.h>
#include "ArkJS.h"
#include "TaskExecutor/TaskExecutor.h"

namespace rnoh {
class ArkTSChannel {
    ArkJS m_arkJs;
    napi_ref m_napi_event_dispatcher_ref;
    TaskExecutor::Shared m_taskExecutor;

  public:
    using Shared = std::shared_ptr<ArkTSChannel>;

    ArkTSChannel(TaskExecutor::Shared taskExecutor, ArkJS arkJs, napi_ref napiEventDispatcherRef) : m_arkJs(arkJs),
                                                                                                    m_napi_event_dispatcher_ref(napiEventDispatcherRef),
                                                                                                    m_taskExecutor(taskExecutor) {}

    void postMessage(std::string type, folly::dynamic payload) {
        m_taskExecutor->runSyncTask(TaskThread::MAIN, [=]() {
            auto napi_event_handler = m_arkJs.getReferenceValue(m_napi_event_dispatcher_ref);
            m_arkJs.call<2>(napi_event_handler, {m_arkJs.createString(type), m_arkJs.createFromDynamic(payload)});
        });
    }
};
} // namespace rnoh