#pragma once

#include "AnimatedNode.h"

#include <folly/dynamic.h>

namespace rnoh {

class ValueAnimatedNode : public AnimatedNode {
public:
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

    double m_value;
    double m_offset;
};

}