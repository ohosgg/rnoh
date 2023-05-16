cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

file(GLOB rnoh_sample_package_SRC CONFIGURE_DEPENDS *.cpp)
add_library(rnoh_sample_package SHARED ${rnoh_sample_package_SRC})
target_include_directories(rnoh_sample_package PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(rnoh_sample_package PUBLIC rnoh)
