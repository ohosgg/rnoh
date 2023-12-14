#pragma once

#include "EventEmitRequestHandler.h"

namespace rnoh {

class EventDispatcher {
  public:
    using Context = EventEmitRequestHandler::Context;

    void sendEvent(Context const &ctx) {
        for (auto &weakHandler : m_requestHandlers) {
            if (auto handler = weakHandler.lock()) {
                handler->handleEvent(ctx);
            }
        }
    }

    void registerEventListener(EventEmitRequestHandler::Shared const &handler) {
        m_requestHandlers.push_back(handler);
    }

    void unregisterEventListener(EventEmitRequestHandler::Shared const &handler) {
        auto it = std::remove_if(m_requestHandlers.begin(), m_requestHandlers.end(), [&handler](auto &weakHandler) {
                      return weakHandler.expired() || weakHandler.lock() == handler;
                  });
        if (it != m_requestHandlers.end()) {
            m_requestHandlers.erase(it, m_requestHandlers.end());
        } else {
            LOG(ERROR) << "Trying to unregister a non-registered listener";
        }
    }
    
    void unregisterExpiredListeners() {
        auto it = std::remove_if(m_requestHandlers.begin(), m_requestHandlers.end(), [](auto &weakHandler) {
            return weakHandler.expired();
        });
        if (it != m_requestHandlers.end()) {
            m_requestHandlers.erase(it, m_requestHandlers.end());
        }
    }

  private:
    std::vector<EventEmitRequestHandler::Weak> m_requestHandlers;
};

} // namespace rnoh