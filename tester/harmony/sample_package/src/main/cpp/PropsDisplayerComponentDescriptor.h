#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewShadowNode.h>

namespace facebook {
namespace react {

extern const char PropsDisplayerComponentName[] = "PropsDisplayer";

class PropsDisplayerProps : public ViewProps {
  public:
    PropsDisplayerProps() = default;

    PropsDisplayerProps(const PropsParserContext &context, const PropsDisplayerProps &sourceProps, const RawProps &rawProps)
        : ViewProps(context, sourceProps, rawProps) {}
};

using PropsDisplayerShadowNode = ConcreteViewShadowNode<
    PropsDisplayerComponentName,
    PropsDisplayerProps,
    ViewEventEmitter>;

class PropsDisplayerComponentDescriptor final
    : public ConcreteComponentDescriptor<PropsDisplayerShadowNode> {
  public:
    PropsDisplayerComponentDescriptor(ComponentDescriptorParameters const &parameters)
        : ConcreteComponentDescriptor(parameters) {}
};

} // namespace react
} // namespace facebook
