#include "RNOH/TextMeasurer.h"
#include "RNOH/ArkJS.h"
#include "RNOH/OHOSTextMeasurer.h"

using namespace facebook;
using namespace rnoh;

react::TextMeasurement TextMeasurer::measure(react::AttributedString attributedString,
                                             react::ParagraphAttributes paragraphAttributes,
                                             react::LayoutConstraints layoutConstraints) {
    react::TextMeasurement result = {{0, 0}, {}};

    auto fragments = attributedString.getFragments();
    auto canUseOHOSTextMeasurer = fragments.size() == 1 && !fragments[0].isAttachment() && isnan(fragments[0].textAttributes.letterSpacing) && isnan(fragments[0].textAttributes.lineHeight);
    if (canUseOHOSTextMeasurer) {
        auto fragment = fragments[0];
        OHOSTextMeasurer ohosTextMeasurer;
        int fontWeight = 0;
        if (fragment.textAttributes.fontWeight.has_value()) {
            fontWeight = int(fragment.textAttributes.fontWeight.value());
        }
        auto size = ohosTextMeasurer.measureText(fragment.string, {
                                                                      .containerWidth = layoutConstraints.maximumSize.width,
                                                                      .fontSize = fragment.textAttributes.fontSize,
                                                                      .fontWeight = fontWeight,
                                                                      .lineHeight = fragment.textAttributes.lineHeight,
                                                                      .maximumNumberOfLines = paragraphAttributes.maximumNumberOfLines,
                                                                  });
        result.size.width = size.width;
        result.size.height = size.height;
    } else {
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
                if (!fragment.textAttributes.fontFamily.empty()) {
                    textAttributesBuilder.addProperty("fontFamily", fragment.textAttributes.fontFamily);
                }
                textAttributesBuilder.addProperty("letterSpacing", fragment.textAttributes.letterSpacing);
                if (fragment.textAttributes.fontWeight.has_value()) {
                    textAttributesBuilder.addProperty("fontWeight", int(fragment.textAttributes.fontWeight.value()));
                }

                auto napiFragmentBuilder = arkJs.createObjectBuilder();
                napiFragmentBuilder
                    .addProperty("string", fragment.string)
                    .addProperty("textAttributes", textAttributesBuilder.build());
                if (fragment.isAttachment())
                    napiFragmentBuilder.addProperty("parentShadowView", arkJs.createObjectBuilder()
                                                                            .addProperty("tag", fragment.parentShadowView.tag)
                                                                            .addProperty("layoutMetrics", arkJs.createObjectBuilder()
                                                                                                              .addProperty("frame", arkJs.createObjectBuilder()
                                                                                                                                        .addProperty("size", arkJs.createObjectBuilder()
                                                                                                                                                                 .addProperty("width", fragment.parentShadowView.layoutMetrics.frame.size.width)
                                                                                                                                                                 .addProperty("height", fragment.parentShadowView.layoutMetrics.frame.size.height)
                                                                                                                                                                 .build())
                                                                                                                                        .build())
                                                                                                              .build())
                                                                            .build());

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

            result.size.width = arkJs.getDouble(arkJs.getObjectProperty(arkJs.getObjectProperty(resultNapiValue, "size"), "width"));
            result.size.height = arkJs.getDouble(arkJs.getObjectProperty(arkJs.getObjectProperty(resultNapiValue, "size"), "height"));
            auto napiAttachments = arkJs.getObjectProperty(resultNapiValue, "attachmentLayouts");
            for (auto i = 0; i < arkJs.getArrayLength(napiAttachments); i++) {
                auto napiAttachment = arkJs.getArrayElement(napiAttachments, i);
                auto napiPositionRelativeToContainer = arkJs.getObjectProperty(napiAttachment, "positionRelativeToContainer");
                auto napiSize = arkJs.getObjectProperty(napiAttachment, "size");
                react::TextMeasurement::Attachment attachment;
                attachment.frame.origin.x = arkJs.getDouble(arkJs.getObjectProperty(napiPositionRelativeToContainer, "x"));
                attachment.frame.origin.y = arkJs.getDouble(arkJs.getObjectProperty(napiPositionRelativeToContainer, "y"));
                attachment.frame.size.width = arkJs.getDouble(arkJs.getObjectProperty(napiSize, "width"));
                attachment.frame.size.height = arkJs.getDouble(arkJs.getObjectProperty(napiSize, "height"));
                result.attachments.push_back(std::move(attachment));
            }
        });
    }

    return result;
}