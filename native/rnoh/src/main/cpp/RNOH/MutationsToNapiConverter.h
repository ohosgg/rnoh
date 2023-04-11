#pragma once

#include <react/renderer/mounting/ShadowViewMutation.h>

#include "RNOH/ArkJS.h"

namespace rnoh {

class MutationsToNapiConverter {
  public:
    MutationsToNapiConverter(ArkJS arkJs);
    napi_value convert(facebook::react::ShadowViewMutationList const &mutations);

  private:
    napi_value convertShadowView(facebook::react::ShadowView const shadowView);
    ArkJS m_arkJs;
};

} // namespace rnoh