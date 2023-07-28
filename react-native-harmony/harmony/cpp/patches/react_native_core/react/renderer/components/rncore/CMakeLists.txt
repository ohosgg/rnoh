cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

add_compile_options(
        -fexceptions
        -frtti
        -std=c++17
        -Wall
        -Wpedantic
        -Wno-gnu-zero-variadic-macro-arguments
        -DLOG_TAG=\"Fabric\")

file(GLOB react_codegen_rncore_SRC CONFIGURE_DEPENDS *.cpp)
add_library(react_codegen_rncore STATIC ${react_codegen_rncore_SRC})

target_include_directories(react_codegen_rncore PUBLIC ${REACT_COMMON_DIR})

target_link_libraries(react_codegen_rncore
        glog
        folly_runtime
        glog_init
        react_render_componentregistry
        react_render_core
        react_render_debug
        react_render_graphics
        react_render_imagemanager
        react_render_mapbuffer
        react_render_uimanager
        rrc_image
        rrc_view
        yoga
)
