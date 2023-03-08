
cmake_minimum_required(VERSION 3.4.1)
project(rnopenharmony)

set(NATIVERENDER_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}")
set(third_party_dir "${CMAKE_CURRENT_SOURCE_DIR}/third-party")

include_directories(${NATIVERENDER_ROOT_PATH}
                    ${NATIVERENDER_ROOT_PATH}/include)

# FMT
set(fmt_include_dir "${third_party_dir}/fmt/include")
set(fmt_src_dir "${third_party_dir}/fmt/src")
add_library(fmt_target)
target_include_directories(fmt_target PRIVATE
    "${fmt_include_dir}"
)
target_sources(fmt_target PRIVATE
    "${fmt_src_dir}/format.cc"
    "${fmt_src_dir}/os.cc"
)

# DOUBLE CONVERSION
set(double_conversion_include_dir "${third_party_dir}/double-conversion")
set(double_conversion_src_dir "${third_party_dir}/double-conversion/double-conversion")
add_library(double_conversion_target)
target_include_directories(double_conversion_target PRIVATE
    "${double_conversion_include_dir}"
)
target_sources(double_conversion_target PRIVATE
    "${double_conversion_src_dir}/bignum-dtoa.cc"
    "${double_conversion_src_dir}/bignum.cc"
    "${double_conversion_src_dir}/cached-powers.cc"
    "${double_conversion_src_dir}/diy-fp.cc"
    "${double_conversion_src_dir}/double-conversion.cc"
    "${double_conversion_src_dir}/fast-dtoa.cc"
    "${double_conversion_src_dir}/fixed-dtoa.cc"
    "${double_conversion_src_dir}/strtod.cc"
)

# GLOG
set(glog_include_dir "${third_party_dir}/glog/src")
set(glog_src_dir "${third_party_dir}/glog/src")
add_library(glog_target)
target_include_directories(glog_target PRIVATE
    "${glog_include_dir}"
    "${glog_include_dir}/base"
)
target_sources(glog_target PRIVATE
    "${glog_src_dir}/demangle.cc"
    "${glog_src_dir}/logging.cc"
    "${glog_src_dir}/raw_logging.cc"
    "${glog_src_dir}/signalhandler.cc"
    "${glog_src_dir}/symbolize.cc"
    "${glog_src_dir}/utilities.cc"
    "${glog_src_dir}/vlog_is_on.cc"
)
target_compile_options(glog_target PRIVATE
    -Wno-shorten-64-to-32
    -Wno-header-hygiene
    -Wno-deprecated-declarations
    -fdeclspec
)

# BOOST
# download Boost 1.76 if necessary https://www.boost.org/users/history/version_1_76_0.html
set(boost_include_dir "${third_party_dir}/rct_boost/boost_1_76_0")

# FOLLY
set(folly_include_dir "${third_party_dir}/folly")
set(folly_src_dir "${third_party_dir}/folly/folly")
add_library(folly_target)
target_include_directories(folly_target PUBLIC
    "${folly_include_dir}"
    "${boost_include_dir}"
    "${double_conversion_include_dir}"
    "${glog_include_dir}"
    "${fmt_include_dir}"
)
set(folly_compile_options
    -DFOLLY_NO_CONFIG=1
    -DFOLLY_MOBILE=1
    -DFOLLY_USE_LIBCPP=1
    -DFOLLY_HAVE_RECVMMSG=1
    -Wno-comma
    -Wno-shorten-64-to-32
    -Wno-documentation
    -faligned-new
)
target_compile_options(folly_target PRIVATE ${folly_compile_options})
target_sources(folly_target PRIVATE
    "${folly_src_dir}/SharedMutex.cpp"
    "${folly_src_dir}/concurrency/CacheLocality.cpp"
    "${folly_src_dir}/detail/Futex.cpp"
    "${folly_src_dir}/portability/Malloc.cpp"
    "${folly_src_dir}/synchronization/ParkingLot.cpp"
    "${folly_src_dir}/system/ThreadId.cpp"
    "${folly_src_dir}/lang/SafeAssert.cpp"
    "${folly_src_dir}/lang/ToAscii.cpp"
    "${folly_src_dir}/dynamic.cpp"
    "${folly_src_dir}/hash/SpookyHashV2.cpp"
    "${folly_src_dir}/json_pointer.cpp"
    "${folly_src_dir}/Conv.cpp"
    "${folly_src_dir}/Format.cpp"
    "${folly_src_dir}/memory/detail/MallocImpl.cpp"
)
target_link_libraries(folly_target PUBLIC
    fmt_target
    glog_target
    double_conversion_target
)

# -------- REACT COMMON --------
set(REACT_COMMON_DIR "${CMAKE_CURRENT_SOURCE_DIR}/ReactCommon")
add_library(folly_runtime ALIAS folly_target)
add_library(glog ALIAS glog_target)

# REACTPERFLOGGER
add_subdirectory("${REACT_COMMON_DIR}/reactperflogger")

# RUNTIMEEXECUTOR
add_subdirectory("${REACT_COMMON_DIR}/runtimeexecutor")
set_target_properties(runtimeexecutor PROPERTIES LINKER_LANGUAGE CXX)

# CALLINVOKER
add_subdirectory("${REACT_COMMON_DIR}/callinvoker")
set_target_properties(runtimeexecutor PROPERTIES LINKER_LANGUAGE CXX)

# JSI
add_subdirectory("${REACT_COMMON_DIR}/jsi")
target_include_directories(jsi PRIVATE
    "${folly_include_dir}"
    "${boost_include_dir}"
)
target_compile_options(jsi PRIVATE ${folly_compile_options})

# CXX REACT
add_subdirectory("${REACT_COMMON_DIR}/cxxreact")
target_compile_options(reactnative PRIVATE ${folly_compile_options})

# ----------------------------------------------------------------------------------------------------------------------

include_directories(
    "${CMAKE_CURRENT_SOURCE_DIR}/"
    "${REACT_COMMON_DIR}/"
)

add_library(rnoh SHARED
    "${CMAKE_CURRENT_SOURCE_DIR}/rnoh_napi.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/ArkJS.cpp"
)
target_link_libraries(rnoh PUBLIC libace_napi.z.so)

