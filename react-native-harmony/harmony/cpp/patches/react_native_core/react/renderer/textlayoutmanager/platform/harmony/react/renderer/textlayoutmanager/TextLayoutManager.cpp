/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "TextLayoutManager.h"

namespace facebook {
namespace react {

void *TextLayoutManager::getNativeTextLayoutManager() const {
    return (void *)this;
}

TextMeasurement TextLayoutManager::measure(
    AttributedStringBox attributedStringBox,
    ParagraphAttributes paragraphAttributes,
    LayoutConstraints layoutConstraints) const {
    attributedStringBox.getValue().getString();
    auto &attributedString = attributedStringBox.getValue();
    return m_measureCache.get(
        {attributedString, paragraphAttributes, layoutConstraints},
        [&](TextMeasureCacheKey const & /*key*/) {
            auto attachments = TextMeasurement::Attachments{};
            auto maximumSize = layoutConstraints.maximumSize;
            auto maxHeight = 0;
            int numberOfLines = paragraphAttributes.maximumNumberOfLines;
            facebook::react::Size measureRes = {};
            for (auto const &fragment : attributedStringBox.getValue().getFragments()) {
                auto fontSize = fragment.textAttributes.fontSize;
                auto lineHeight = fragment.textAttributes.lineHeight;
                auto fontWeight = fragment.textAttributes.fontWeight;
                int fontWeightNum = 0;
                if (fontWeight.has_value()) {
                    fontWeightNum = static_cast<int>(fontWeight.value());
                }
                auto letterSpacing = fragment.textAttributes.letterSpacing;
                measureRes = m_textLayoutManagerDelegate->measure(attributedStringBox.getValue().getString(),
                                                                  fontSize, lineHeight, fontWeightNum, maximumSize.width, numberOfLines, letterSpacing);
                maxHeight = (maxHeight > measureRes.height ? maxHeight : measureRes.height);
                if (fragment.isAttachment()) {
                    attachments.push_back(TextMeasurement::Attachment{{{0, 0}, {0, 0}}, false});
                }
            }
            measureRes.height = maxHeight;
            return TextMeasurement{measureRes, attachments};
        });
}

TextMeasurement TextLayoutManager::measure(
    AttributedStringBox attributedStringBox,
    ParagraphAttributes paragraphAttributes,
    LayoutConstraints layoutConstraints,
    std::shared_ptr<void> hostTextStorage) const {
    return this->measure(attributedStringBox, paragraphAttributes, layoutConstraints);
}

LinesMeasurements TextLayoutManager::measureLines(
    AttributedString attributedString,
    ParagraphAttributes paragraphAttributes,
    Size size) const {
    return {};
}

std::shared_ptr<void> TextLayoutManager::getHostTextStorage(
    AttributedString attributedString,
    ParagraphAttributes paragraphAttributes,
    LayoutConstraints layoutConstraints) const {
    return nullptr;
}

} // namespace react
} // namespace facebook
