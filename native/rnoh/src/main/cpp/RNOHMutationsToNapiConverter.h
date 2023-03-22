#pragma once

#include "ArkJS.h"
#include <react/renderer/mounting/ShadowViewMutation.h>

class RNOHMutationsToNapiConverter {
  public:
    RNOHMutationsToNapiConverter(ArkJS arkJs);
    napi_value convert(facebook::react::ShadowViewMutationList const &mutations);

  private:
    napi_value convertShadowView(facebook::react::ShadowView const shadowView);
    ArkJS m_arkJs;
};