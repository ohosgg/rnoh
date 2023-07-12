#include "TransformAnimatedNode.h"

namespace rnoh {

using namespace facebook;

using Transform = react::Transform;

static Transform applyTransformOperation(Transform const &transform, std::string const &property, double value) {
    Transform operation;
    if (property == "translateX") {
        operation = Transform::Translate(value, 0, 0);
    } else if (property == "translateY") {
        operation = Transform::Translate(0, value, 0);
    } else {
        throw new std::runtime_error("Unsupported transform property " + property);
    }

    return transform * operation;
}


static folly::dynamic transformToDynamic(Transform const &transform) {
    auto const &matrix = transform.matrix;
    return folly::dynamic::array(
        matrix[0],
        matrix[1],
        matrix[2],
        matrix[3],
        matrix[4],
        matrix[5],
        matrix[6],
        matrix[7],
        matrix[8],
        matrix[9],
        matrix[10],
        matrix[11],
        matrix[12],
        matrix[13],
        matrix[14],
        matrix[15]);
}

TransformAnimatedNode::TransformAnimatedNode(folly::dynamic const &config, AnimatedNodesManager &nodesManager)
    : m_nodesManager(nodesManager) {
    auto transforms = config["transforms"];
    for (auto transformConfig : transforms) {
        std::string property = transformConfig["property"].getString();
        std::string type = transformConfig["type"].getString();
        if (type == "animated") {
            m_transforms.push_back(AnimatedTransformConfig{
                .property = std::move(property),
                .nodeTag = static_cast<NodeTag>(transformConfig["nodeTag"].getDouble())});
        } else {
            m_transforms.push_back(StaticTransformConfig{
                .property = std::move(property),
                .value = transformConfig["value"].getDouble()});
        }
    }
}

folly::dynamic TransformAnimatedNode::getTransform() const {
    Transform transform;
    for (auto config : m_transforms) {
        double value;
        std::string property;
        if (std::holds_alternative<StaticTransformConfig>(config)) {
            auto staticConfig = std::get<StaticTransformConfig>(config);
            value = staticConfig.value;
            property = staticConfig.property;
        } else {
            auto animatedConfig = std::get<AnimatedTransformConfig>(config);
            auto &node = m_nodesManager.getValueNodeByTag(animatedConfig.nodeTag);
            value = node.getValue();
            property = animatedConfig.property;
        }

        transform = applyTransformOperation(transform, property, value);
    }
    return transformToDynamic(transform);
}

} // namespace rnoh