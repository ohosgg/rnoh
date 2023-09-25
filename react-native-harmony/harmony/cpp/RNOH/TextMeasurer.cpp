#include "RNOH/TextMeasurer.h"
#include "RNOH/ArkJS.h"

using namespace facebook;
using namespace rnoh;

react::Size TextMeasurer::measure(react::AttributedString attributedString,
                                  react::ParagraphAttributes paragraphAttributes,
                                  react::LayoutConstraints layoutConstraints) {
    react::Size result = {};
    m_taskExecutor->runSyncTask(TaskThread::MAIN, [&result, measureTextRef = m_measureTextFnRef, env = m_env, &attributedString, &paragraphAttributes, &layoutConstraints]() {
        ArkJS arkJs(env);
        auto napiMeasureText = arkJs.getReferenceValue(measureTextRef);

        auto napiAttributedStringBuilder = arkJs.createObjectBuilder();
        napiAttributedStringBuilder.addProperty("string", attributedString.getString());
        std::vector<napi_value> napiFragments = {};
        for (auto fragment : attributedString.getFragments()) {
            auto textAttributesBuilder = arkJs.createObjectBuilder();
            textAttributesBuilder.addProperty("fontSize", fragment.textAttributes.fontSize);
            textAttributesBuilder.addProperty("lineHeight", fragment.textAttributes.lineHeight);
            textAttributesBuilder.addProperty("letterSpacing", fragment.textAttributes.letterSpacing);
            if (fragment.textAttributes.fontWeight.has_value()) {
                textAttributesBuilder.addProperty("fontWeight", int(fragment.textAttributes.fontWeight.value()));
            }

            auto napiFragmentBuilder = arkJs.createObjectBuilder();
            napiFragmentBuilder.addProperty("string", fragment.string);
            napiFragmentBuilder.addProperty("textAttributes", textAttributesBuilder.build());
            napiFragments.push_back(napiFragmentBuilder.build());
        }
        napiAttributedStringBuilder.addProperty("fragments", arkJs.createArray(napiFragments));

        auto napiParagraphAttributesBuilder = arkJs.createObjectBuilder();
        napiParagraphAttributesBuilder.addProperty("maximumNumberOfLines", paragraphAttributes.maximumNumberOfLines);

        auto napiLayoutConstraintsBuilder = arkJs.createObjectBuilder();
        napiLayoutConstraintsBuilder.addProperty("maximumSize", arkJs.createObjectBuilder()
                                                                    .addProperty("width", layoutConstraints.maximumSize.width)
                                                                    .addProperty("height", layoutConstraints.maximumSize.height)
                                                                    .build());

        auto resultNapiValue = arkJs.call(napiMeasureText, {napiAttributedStringBuilder.build(), napiParagraphAttributesBuilder.build(), napiLayoutConstraintsBuilder.build()});

        result.width = arkJs.getDouble(arkJs.getObjectProperty(resultNapiValue, "width"));
        result.height = arkJs.getDouble(arkJs.getObjectProperty(resultNapiValue, "height"));
    });
    return result;
}