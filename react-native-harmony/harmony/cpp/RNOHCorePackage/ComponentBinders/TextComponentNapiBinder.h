#pragma once
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"
#include <react/renderer/components/text/ParagraphState.h>
#include <react/renderer/components/text/ParagraphProps.h>
#include <react/renderer/core/ConcreteState.h>
#include <react/renderer/components/view/YogaStylableProps.h>
#include <react/renderer/components/view/conversions.h>
#include <react/renderer/core/LayoutPrimitives.h>
#define EnumToString(x) #x

namespace rnoh {

class TextComponentNapiBinder : public ViewComponentNapiBinder {
  public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiViewProps = ViewComponentNapiBinder::createProps(env, shadowView);
        if (auto state = std::dynamic_pointer_cast<const facebook::react::ConcreteState<facebook::react::ParagraphState>>(shadowView.state)) {
            auto data = state->getData();
            ArkJS arkJs(env);
            auto propsObjBuilder = arkJs.getObjectBuilder(napiViewProps);
            auto fragmentsPayload = std::vector<napi_value>();
            auto fragments = data.attributedString.getFragments();

            if (auto props = std::dynamic_pointer_cast<const facebook::react::ParagraphProps>(shadowView.props)) {
                auto textAlign = props->textAttributes.alignment;
                if (textAlign.has_value()) {
                    propsObjBuilder.addProperty("textAlign", textAlignmentToString(textAlign.value()));
                }
                propsObjBuilder
                    .addProperty("maximumNumberOfLines", props->paragraphAttributes.maximumNumberOfLines)
                    .addProperty("ellipsizeMode", static_cast<int>(props->paragraphAttributes.ellipsizeMode));

                auto rawProps = props->rawProps;
                std::string textAlignVertical = "auto";
                if (rawProps.count("textAlignVertical") > 0) {
                    textAlignVertical = rawProps["textAlignVertical"].asString();
                }
                auto selectable = false;
                if (rawProps.count("selectable") > 0) {
                    selectable = rawProps["selectable"].asBool();
                }
                auto disabled = false;
                if (rawProps.count("disabled") > 0) {
                    disabled = rawProps["disabled"].asBool();
                }
                propsObjBuilder
                    .addProperty("textAlignVertical", textAlignVertical)
                    .addProperty("selectable", selectable)
                    .addProperty("disabled", disabled);
            }

            for (auto fragment : fragments) {
                auto fragmentObjBuilder = arkJs.createObjectBuilder();
                auto textAttributes = fragment.textAttributes;

                if (textAttributes.textTransform.has_value()) {
                    fragmentObjBuilder.addProperty("textTransform", textTransformToString(textAttributes.textTransform.value()));
                }
                auto textShadowPropsBuilder = ArkJS(env).createObjectBuilder();
                textShadowPropsBuilder
                    .addProperty("textShadowColor", textAttributes.textShadowColor)
                    .addProperty("textShadowOffset", ArkJS(env).createObjectBuilder().addProperty("width", textAttributes.textShadowOffset->width).addProperty("height", textAttributes.textShadowOffset->height).build())
                    .addProperty("textShadowRadius", textAttributes.textShadowRadius);
                fragmentObjBuilder.addProperty("textShadowProps", textShadowPropsBuilder.build());

                fragmentObjBuilder
                    .addProperty("text", fragment.string)
                    .addProperty("fontColor", textAttributes.foregroundColor)
                    .addProperty("lineHeight", textAttributes.lineHeight)
                    .addProperty("backgroundColor", textAttributes.backgroundColor)
                    .addProperty("fontSize", textAttributes.fontSize)
                    .addProperty("textDecorationColor", textAttributes.textDecorationColor)
                    .addProperty("letterSpacing", textAttributes.letterSpacing);
                auto fontWeight = textAttributes.fontWeight;
                if (fontWeight.has_value()) {
                    fragmentObjBuilder.addProperty("fontWeight", static_cast<int>(fontWeight.value()));
                }
                auto textAlign = textAttributes.alignment;
                if (textAttributes.fontStyle == facebook::react::FontStyle::Italic) {
                    fragmentObjBuilder.addProperty("fontStyle", "italic");
                } else {
                    fragmentObjBuilder.addProperty("fontStyle", "normal");
                }
                auto textDecorationLine = textAttributes.textDecorationLineType;
                if (textDecorationLine.has_value()) {
                    fragmentObjBuilder.addProperty("textDecorationLine", static_cast<int>(textDecorationLine.value()));
                }
                if (fragment.isAttachment())
                    fragmentObjBuilder.addProperty("parentShadowView", arkJs.createObjectBuilder()
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
                fragmentsPayload.push_back(fragmentObjBuilder.build());
            }
            auto fragmentsArray = arkJs.createArray(fragmentsPayload);
            propsObjBuilder.addProperty("fragments", fragmentsArray);
            propsObjBuilder.addProperty("padding", getParagraphPaddingProps(shadowView));
            return propsObjBuilder.build();
        }
        return napiViewProps;
    };

  private:
    std::string textAlignmentToString(facebook::react::TextAlignment alignment) {
        switch (alignment) {
        case facebook::react::TextAlignment::Natural:
            return "natural";
        case facebook::react::TextAlignment::Left:
            return "left";
        case facebook::react::TextAlignment::Right:
            return "right";
        case facebook::react::TextAlignment::Center:
            return "center";
        case facebook::react::TextAlignment::Justified:
            return "justified";
        }
    };
    std::string textTransformToString(facebook::react::TextTransform textTransform) {
        switch (textTransform) {
        case facebook::react::TextTransform::Uppercase:
            return "uppercase";
        case facebook::react::TextTransform::Lowercase:
            return "lowercase";
        case facebook::react::TextTransform::Capitalize:
            return "capitalize";
        default:
            return "none";
        }
    };

    void setHorizontalPadding(YGStyle::Edges const &yogaPadding, bool isRTL, float &left, float &right) {
        if (facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeLeft]).has_value()) {
            left = facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeLeft]).value();
        }
        if (facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeRight]).has_value()) {
            right = facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeRight]).value();
        }
        if (facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeStart]).has_value()) {
            float paddingStart = facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeStart]).value();
            isRTL ? (right = paddingStart) : (left = paddingStart);
        }
        if (facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeEnd]).has_value()) {
            float paddingEnd = facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeEnd]).value();
        }
        if (facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeHorizontal]).has_value()) {
            float paddingHorizontal = facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeHorizontal]).value();
            left = right = paddingHorizontal;
        }
    };

    void setVerticalPadding(YGStyle::Edges const &yogaPadding, float &top, float &bottom) {
        if (facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeTop]).has_value()) {
            top = facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeTop]).value();
        }
        if (facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeBottom]).has_value()) {
            bottom = facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeBottom]).value();
        }
        if (facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeVertical]).has_value()) {
            float paddingVertical = facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeVertical]).value();
            top = bottom = paddingVertical;
        }
    };

    /*
      top: number,
      right: number,
      bottom: number,
      left: number
    */
    folly::dynamic getParagraphPaddingProps(facebook::react::ShadowView const shadowView) {
        float top = 0, right = 0, bottom = 0, left = 0;
        auto isRTL =
            bool{shadowView.layoutMetrics.layoutDirection == facebook::react::LayoutDirection::RightToLeft};
        if (auto props = std::dynamic_pointer_cast<const facebook::react::ParagraphProps>(shadowView.props)) {
            auto yogaPadding = props->yogaStyle.padding();
            if (facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeAll]).has_value()) {
                float padding = facebook::react::optionalFloatFromYogaValue(yogaPadding[YGEdgeAll]).value();
                top = right = bottom = left = padding;
            }
            setHorizontalPadding(yogaPadding, isRTL, left, right);
            setVerticalPadding(yogaPadding, top, bottom);
        }
        return folly::dynamic::object("top", top)("right", right)("bottom", bottom)("left", left);
    }
};

} // namespace rnoh
