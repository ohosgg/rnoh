project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../node_modules/@ohos/rnoh/src/main/cpp")

add_subdirectory("${RNOH_CPP_DIR}" ./rn)
add_library(rnoh_app SHARED
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)

target_link_libraries(rnoh_app PUBLIC rnoh)
