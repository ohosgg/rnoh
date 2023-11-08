#pragma once
#include <native_drawing/drawing_text_typography.h>
#include <native_drawing/drawing_font_collection.h>
#include <string>

namespace rnoh {

class OHOSTextMeasurer {

  private:
    OH_Drawing_FontCollection *fontCollection;
    OH_Drawing_TypographyStyle *typographyStyle;

  public:
    struct Size {
        double width;
        double height;
    };

    struct Config {
        double containerWidth;
        double fontSize;
        int fontWeight;
        float lineHeight;
        int maximumNumberOfLines;
    };

    OHOSTextMeasurer() {
        this->fontCollection = OH_Drawing_CreateFontCollection();
    }

    ~OHOSTextMeasurer() {
        OH_Drawing_DestroyFontCollection(this->fontCollection);
    }

    Size measureText(std::string text, Config config) {
        auto typographyStyle = OH_Drawing_CreateTypographyStyle();
        if (config.maximumNumberOfLines) {
            OH_Drawing_SetTypographyTextMaxLines(typographyStyle, config.maximumNumberOfLines);
        }
        auto typographyHandler = OH_Drawing_CreateTypographyHandler(typographyStyle, fontCollection);
        auto textStyle = OH_Drawing_CreateTextStyle();
        if (config.fontSize) {
            OH_Drawing_SetTextStyleFontSize(textStyle, config.fontSize);
        }
        if (config.fontWeight) {
            OH_Drawing_SetTextStyleFontWeight(textStyle, this->mapValueToFontWeight(config.fontWeight));
        }
        if (!isnan(config.lineHeight)) {
            OH_Drawing_SetTextStyleFontHeight(textStyle, config.lineHeight);
        }
        OH_Drawing_TypographyHandlerPushTextStyle(typographyHandler, textStyle);
        OH_Drawing_TypographyHandlerAddText(typographyHandler, text.c_str());
        auto typography = OH_Drawing_CreateTypography(typographyHandler);
        OH_Drawing_TypographyLayout(typography, config.containerWidth ? config.containerWidth : std::numeric_limits<double>::max());
        auto height = OH_Drawing_TypographyGetHeight(typography);
        auto longestLineWidth = OH_Drawing_TypographyGetLongestLine(typography);
        OH_Drawing_DestroyTextStyle(textStyle);
        OH_Drawing_DestroyTypography(typography);
        OH_Drawing_DestroyTypographyHandler(typographyHandler);
        OH_Drawing_DestroyTypographyStyle(typographyStyle);
        Size size{.width = longestLineWidth, .height = height};
        return size;
    }

    OH_Drawing_FontWeight mapValueToFontWeight(int value) {
        switch (value) {
        case 100:
            return OH_Drawing_FontWeight::FONT_WEIGHT_100;
        case 200:
            return OH_Drawing_FontWeight::FONT_WEIGHT_200;
        case 300:
            return OH_Drawing_FontWeight::FONT_WEIGHT_300;
        case 400:
            return OH_Drawing_FontWeight::FONT_WEIGHT_400;
        case 500:
            return OH_Drawing_FontWeight::FONT_WEIGHT_500;
        case 600:
            return OH_Drawing_FontWeight::FONT_WEIGHT_600;
        case 700:
            return OH_Drawing_FontWeight::FONT_WEIGHT_700;
        case 800:
            return OH_Drawing_FontWeight::FONT_WEIGHT_800;
        case 900:
            return OH_Drawing_FontWeight::FONT_WEIGHT_900;
        default:
            return OH_Drawing_FontWeight::FONT_WEIGHT_400;
        }
    }
};
} // namespace rnoh
