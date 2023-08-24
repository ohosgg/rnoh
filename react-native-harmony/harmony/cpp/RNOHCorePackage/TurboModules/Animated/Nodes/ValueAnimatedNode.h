#pragma once

#include "AnimatedNode.h"

#include <folly/dynamic.h>

namespace rnoh {

class ValueAnimatedNode : public AnimatedNode {
public:
    using AnimatedNodeValueListener = std::function<void(double)>;

    ValueAnimatedNode() {}

    ValueAnimatedNode(folly::dynamic const &config) {
        m_value = config["value"].getDouble();
        m_offset = config["offset"].getDouble();
    }

    double getValue() {
        return m_value + m_offset;
    }

    void setValue(double value) {
        m_value = value;
    }

    void setOffset(double offset) {
        m_offset = offset;
    }

    void flattenOffset() {
        m_value += m_offset;
        m_offset = 0;
    }

    void extractOffset() {
        m_offset += m_value;
        m_value = 0;
    }

    void onValueUpdate() {
        if (m_valueListener.has_value()) {
            m_valueListener.value()(getValue());
        }
    }

    void setValueListener(AnimatedNodeValueListener &&listener) {
        if (m_valueListener.has_value()) {
            throw std::runtime_error("AnimatedNode already has a value listener");
        }
        m_valueListener = std::move(listener);
    }

    void removeValueListener() {
        m_valueListener = std::nullopt;
    }

    double m_value = 0.0;
    double m_offset = 0.0;
    std::optional<AnimatedNodeValueListener> m_valueListener;
};

}