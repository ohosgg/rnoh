#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewShadowNode.h>

namespace facebook {
namespace react {

extern const char SampleViewComponentName[] = "SampleView";

class SampleViewProps : public ViewProps {
  public:
    SampleViewProps() = default;

    SampleViewProps(const PropsParserContext &context, const SampleViewProps &sourceProps, const RawProps &rawProps)
        : ViewProps(context, sourceProps, rawProps) {}
};

using SampleViewShadowNode = ConcreteViewShadowNode<
    SampleViewComponentName,
    SampleViewProps,
    ViewEventEmitter>;

class SampleViewComponentDescriptor final
    : public ConcreteComponentDescriptor<SampleViewShadowNode> {
  public:
    SampleViewComponentDescriptor(ComponentDescriptorParameters const &parameters)
        : ConcreteComponentDescriptor(parameters) {}
};

} // namespace react
} // namespace facebook
