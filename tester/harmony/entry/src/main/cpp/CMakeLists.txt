project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp") # In real projects, you may need to update this path.

execute_process(
  COMMAND "${NODE_MODULES}/.bin/react-native" create-metro-host-constants-harmony --output "${CMAKE_CURRENT_SOURCE_DIR}/../ets/codegen/MetroHostConstants.ts"
)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: add_package_subdirectories
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
# RNOH_END: add_package_subdirectories

add_library(rnoh_app SHARED
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: link_packages
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
# RNOH_END: link_packages