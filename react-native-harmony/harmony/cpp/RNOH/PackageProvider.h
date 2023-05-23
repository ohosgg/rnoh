#pragma once
#include <vector>
#include "RNOH/Package.h"

namespace rnoh {

class PackageProvider {
  public:
    std::vector<std::shared_ptr<Package>> getPackages(Package::Context ctx);
};

} // namespace rnoh