#include "RNOHMutationsToNapiConverter.h"
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/components/image/ImageProps.h>
#include <react/renderer/components/text/ParagraphState.h>
#include <react/renderer/components/textinput/TextInputProps.h>
#include <react/renderer/core/ConcreteState.h>

using namespace facebook::react;

RNOHMutationsToNapiConverter::RNOHMutationsToNapiConverter(ArkJS arkJs) : m_arkJs(arkJs) {
}

napi_value RNOHMutationsToNapiConverter::convert(ShadowViewMutationList const &mutations) {
    std::vector<napi_value> napiMutations;
    for (auto &mutation : mutations) {
        auto objBuilder = m_arkJs.createObjectBuilder().addProperty("type", mutation.type);
        switch (mutation.type) {
        case ShadowViewMutation::Type::Create: {
            objBuilder
                .addProperty("descriptor", this->convertShadowView(mutation.newChildShadowView));
            break;
        }
        case ShadowViewMutation::Type::Remove: {
            objBuilder
                .addProperty("childTag", mutation.oldChildShadowView.tag)
                .addProperty("parentTag", mutation.parentShadowView.tag);
            break;
        }
        case ShadowViewMutation::Type::Update: {
            objBuilder
                .addProperty("descriptor", this->convertShadowView(mutation.newChildShadowView));
            break;
        }
        case ShadowViewMutation::Type::Insert: {
            objBuilder
                .addProperty("childTag", mutation.newChildShadowView.tag)
                .addProperty("parentTag", mutation.parentShadowView.tag);
            break;
        }
        case ShadowViewMutation::Type::Delete: {
            objBuilder.addProperty("tag", mutation.oldChildShadowView.tag);
            break;
        }
        }
        napiMutations.push_back(objBuilder.build());
    }
    return m_arkJs.createArray(napiMutations);
}

napi_value RNOHMutationsToNapiConverter::convertShadowView(ShadowView const shadowView) {
    auto propsObjBuilder = m_arkJs.createObjectBuilder();
    propsObjBuilder
        .addProperty("top", shadowView.layoutMetrics.frame.origin.y)
        .addProperty("left", shadowView.layoutMetrics.frame.origin.x)
        .addProperty("width", shadowView.layoutMetrics.frame.size.width)
        .addProperty("height", shadowView.layoutMetrics.frame.size.height);
    if (auto props = std::dynamic_pointer_cast<const ImageProps>(shadowView.props)) {
        ImageSource imageSource;
        if (props->sources.size() > 0) {
            imageSource = props->sources[0];
            propsObjBuilder.addProperty("uri", imageSource.uri);
        }
    }
    if (auto props = std::dynamic_pointer_cast<const ViewProps>(shadowView.props)) {
        propsObjBuilder.addProperty("backgroundColor", props->backgroundColor);
    }

    if (auto state = std::dynamic_pointer_cast<const ConcreteState<ParagraphState>>(shadowView.state)) {
        auto string = state->getData().attributedString.getString();
        propsObjBuilder.addProperty("string", string);
    }
    if (auto props = std::dynamic_pointer_cast<const TextInputProps>(shadowView.props)) {
        propsObjBuilder.addProperty("text", props->text);
    }
    return m_arkJs.createObjectBuilder()
        .addProperty("tag", shadowView.tag)
        .addProperty("type", shadowView.componentName)
        .addProperty("props", propsObjBuilder.build())
        .addProperty("childrenTags", m_arkJs.createArray())
        .build();
}
