#pragma once
#include <react/renderer/graphics/Size.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>
#include <string>
#include "napi/native_api.h"
#include "RNOH/TaskExecutor.h"

namespace rnoh {
class TextMeasurer : public facebook::react::TextLayoutManagerDelegate {

  public:
    TextMeasurer(napi_env env, napi_ref measureTextFnRef, std::shared_ptr<TaskExecutor> taskExecutor)
        : m_env(env),
          m_measureTextFnRef(measureTextFnRef),
          m_taskExecutor(taskExecutor) {}

    facebook::react::Size measure(std::string textContent) override;

  private:
    napi_env m_env;
    napi_ref m_measureTextFnRef;
    std::shared_ptr<TaskExecutor> m_taskExecutor;
};
} // namespace rnoh