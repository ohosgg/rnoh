#include "RNOH/TextMeasurer.h"
#include "RNOH/ArkJS.h"

using namespace facebook;
using namespace rnoh;

react::Size TextMeasurer::measure(
    std::string textContent,
    float fontSize,
    float lineHeight,
    int fontWeight,
    float maxWidth,
    int numberOfLines,
    float letterSpacing) {
    react::Size result = {};
    m_taskExecutor->runSyncTask(TaskThread::MAIN, [&result, measureTextRef = m_measureTextFnRef, env = m_env, &textContent, fontSize, lineHeight, fontWeight, maxWidth, numberOfLines, letterSpacing]() {
        ArkJS arkJs(env);
        auto measureTextNapiValue = arkJs.getReferenceValue(measureTextRef);
        auto objectBuilder = arkJs.createObjectBuilder();
        objectBuilder
            .addProperty("textContent", textContent)
            .addProperty("fontSize", fontSize)
            .addProperty("lineHeight", lineHeight)
            .addProperty("maxWidth", maxWidth)
            .addProperty("numberOfLines", numberOfLines);
        if (fontWeight != 0) {
            objectBuilder.addProperty("fontWeight", fontWeight);
        }
        if (!isnan(letterSpacing)) {
            objectBuilder.addProperty("letterSpacing", letterSpacing);
        }
        auto resultNapiValue = arkJs.call(measureTextNapiValue, {objectBuilder.build()});
        result.width = arkJs.getDouble(arkJs.getObjectProperty(resultNapiValue, "width"));
        result.height = arkJs.getDouble(arkJs.getObjectProperty(resultNapiValue, "height"));
    });
    return result;
}