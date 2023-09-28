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
    auto &attributedString = attributedStringBox.getValue();
    return m_measureCache.get(
        {attributedString, paragraphAttributes, layoutConstraints},
        [&](TextMeasureCacheKey const & /*key*/) {
            return m_textLayoutManagerDelegate->measure(attributedString, paragraphAttributes, layoutConstraints);
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
