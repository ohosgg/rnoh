#include "RNOH/ArkJS.h"
#include "RNOH/MutationsToNapiConverter.h"
#include "MutationsToNapiConverter.h"

using namespace facebook;
using namespace rnoh;

MutationsToNapiConverter::MutationsToNapiConverter(ComponentNapiBinderByString &&componentNapiBinderByName)
    : m_componentNapiBinderByName(std::move(componentNapiBinderByName)) {}

napi_value MutationsToNapiConverter::convert(napi_env env, react::ShadowViewMutationList const &mutations) {
    std::vector<napi_value> napiMutations;
    ArkJS arkJs(env);
    for (auto &mutation : mutations) {
        auto objBuilder = arkJs.createObjectBuilder().addProperty("type", mutation.type);
        switch (mutation.type) {
        case react::ShadowViewMutation::Type::Create: {
            objBuilder
                .addProperty("descriptor", this->convertShadowView(env, mutation.newChildShadowView));
            break;
        }
        case react::ShadowViewMutation::Type::Remove: {
            objBuilder
                .addProperty("childTag", mutation.oldChildShadowView.tag)
                .addProperty("parentTag", mutation.parentShadowView.tag);
            break;
        }
        case react::ShadowViewMutation::Type::Update: {
            objBuilder
                .addProperty("descriptor", this->convertShadowView(env, mutation.newChildShadowView));
            break;
        }
        case react::ShadowViewMutation::Type::Insert: {
            objBuilder
                .addProperty("childTag", mutation.newChildShadowView.tag)
                .addProperty("parentTag", mutation.parentShadowView.tag);
            break;
        }
        case react::ShadowViewMutation::Type::Delete: {
            objBuilder.addProperty("tag", mutation.oldChildShadowView.tag);
            break;
        }
        }
        napiMutations.push_back(objBuilder.build());
    }
    return arkJs.createArray(napiMutations);
}

napi_value MutationsToNapiConverter::convertShadowView(napi_env env, react::ShadowView const shadowView) {
    try {
        auto componentNapiBinder = m_componentNapiBinderByName.at(shadowView.componentName);
        ArkJS arkJs(env);
        return arkJs.createObjectBuilder()
            .addProperty("tag", shadowView.tag)
            .addProperty("type", shadowView.componentName)
            .addProperty("props", componentNapiBinder->createProps(env, shadowView))
            .addProperty("state", componentNapiBinder->createState(env, shadowView))
            .addProperty("childrenTags", arkJs.createArray())
            .build();
    } catch (const std::out_of_range &e) {
        LOG(INFO) << "Couldn't find ComponentNapiBinder for: " << shadowView.componentName;
        throw e;
    }
}
