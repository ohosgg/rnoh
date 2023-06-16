#include "RNOH/TextMeasurer.h"
#include "RNOH/ArkJS.h"

using namespace facebook;
using namespace rnoh;

react::Size TextMeasurer::measure(std::string textContent) {
    react::Size result = {};
    m_taskExecutor->runSyncTask(TaskThread::MAIN, [&result, measureTextRef = m_measureTextFnRef, env = m_env, &textContent]() {
        ArkJS arkJs(env);
        auto measureTextNapiValue = arkJs.getReferenceValue(measureTextRef);
        auto resultNapiValue = arkJs.call(measureTextNapiValue, {arkJs.createObjectBuilder()
                                                                     .addProperty("textContent", textContent)
                                                                     .build()});
        result.width = arkJs.getDouble(arkJs.getObjectProperty(resultNapiValue, "width"));
        result.height = arkJs.getDouble(arkJs.getObjectProperty(resultNapiValue, "height"));
    });
    return result;
}