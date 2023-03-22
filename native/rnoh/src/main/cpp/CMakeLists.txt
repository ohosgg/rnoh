
cmake_minimum_required(VERSION 3.4.1)
project(rnopenharmony)

set(NATIVERENDER_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}")
set(third_party_dir "${CMAKE_CURRENT_SOURCE_DIR}/third-party")

add_compile_options("-Wno-unused-command-line-argument")

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
target_include_directories(glog_target PUBLIC
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
set(boost_libs_dir "${third_party_dir}/boost/libs")
file(GLOB boost_include_dirs "${boost_libs_dir}/*/include")
set(BOOST_ENABLE_CMAKE On)
add_subdirectory("${boost_libs_dir}/core")
add_subdirectory("${boost_libs_dir}/config")
add_subdirectory("${boost_libs_dir}/assert")
add_subdirectory("${boost_libs_dir}/static_assert")
add_subdirectory("${boost_libs_dir}/type_traits")
add_subdirectory("${boost_libs_dir}/throw_exception")
add_subdirectory("${boost_libs_dir}/move")
add_subdirectory("${boost_libs_dir}/predef")
add_subdirectory("${boost_libs_dir}/pool")
add_subdirectory("${boost_libs_dir}/mp11")
add_subdirectory("${boost_libs_dir}/smart_ptr")
add_subdirectory("${boost_libs_dir}/winapi")
add_subdirectory("${boost_libs_dir}/integer")
add_subdirectory("${boost_libs_dir}/context")

# LIBEVENT
add_library(libevent)
set(libevent_src_dir "${third_party_dir}/libevent")
set(libevent_include_dirs
    "${third_party_dir}/libevent_patch/${OHOS_ARCH}"
    "${third_party_dir}/libevent/include"
    "${third_party_dir}/libevent/compat"
)
target_include_directories(libevent PUBLIC
    ${libevent_include_dirs}
)
target_sources(libevent PRIVATE
    "${libevent_src_dir}/event.c"
    "${libevent_src_dir}/buffer.c"
    "${libevent_src_dir}/bufferevent.c"
    "${libevent_src_dir}/bufferevent_filter.c"
    "${libevent_src_dir}/bufferevent_pair.c"
    "${libevent_src_dir}/bufferevent_ratelim.c"
    "${libevent_src_dir}/bufferevent_sock.c"
    "${libevent_src_dir}/epoll.c"
    "${libevent_src_dir}/evmap.c"
    "${libevent_src_dir}/evthread.c"
    "${libevent_src_dir}/evthread_pthread.c"
    "${libevent_src_dir}/evutil.c"
    "${libevent_src_dir}/evutil_rand.c"
    "${libevent_src_dir}/evutil_time.c"
    "${libevent_src_dir}/listener.c"
    "${libevent_src_dir}/log.c"
    "${libevent_src_dir}/poll.c"
    "${libevent_src_dir}/signal.c"
    "${libevent_src_dir}/strlcpy.c"
    "${libevent_src_dir}/select.c"
)


# FOLLY
set(folly_include_dir "${third_party_dir}/folly")
set(folly_src_dir "${third_party_dir}/folly/folly")
add_library(folly_target)
target_include_directories(folly_target PUBLIC
    "${folly_include_dir}"
    "${boost_include_dirs}"
    "${double_conversion_include_dir}"
    "${glog_include_dir}"
    "${fmt_include_dir}"
)
set(folly_compile_options
    -DFOLLY_NO_CONFIG=1
    -DFOLLY_MOBILE=1
    -DFOLLY_USE_LIBCPP=1
    -DFOLLY_HAVE_RECVMMSG=1
    -DFOLLY_HAVE_PTHREAD=1
    -Wno-comma
    -Wno-shorten-64-to-32
    -Wno-documentation
    -faligned-new
)
target_compile_options(folly_target PUBLIC ${folly_compile_options})
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
    "${folly_src_dir}/json.cpp"
    "${folly_src_dir}/Unicode.cpp"
    "${folly_src_dir}/lang/Assume.cpp"
    "${folly_src_dir}/ScopeGuard.cpp"
)
target_link_libraries(folly_target PUBLIC
    fmt_target
    glog_target
    double_conversion_target
)

# FOLLY FUTURES
add_library(folly_futures)
target_include_directories(folly_futures PUBLIC
    "${folly_include_dir}"
    "${boost_include_dirs}"
    "${double_conversion_include_dir}"
    "${glog_include_dir}"
    "${fmt_include_dir}"
    "${libevent_include_dirs}"
)
target_compile_options(folly_futures PRIVATE
    ${folly_compile_options}
    "-Wno-nullability-completeness"
    "-std=c++17"
)
target_sources(folly_futures PRIVATE
    "${third_party_dir}/folly_patch/Demangle.cpp"
    "${folly_src_dir}/ExceptionString.cpp"
    "${folly_src_dir}/ExceptionWrapper.cpp"
    "${folly_src_dir}/Executor.cpp"
    "${folly_src_dir}/FileUtil.cpp"
    "${folly_src_dir}/ScopeGuard.cpp"
    "${folly_src_dir}/String.cpp"
    "${folly_src_dir}/Singleton.cpp"
    "${folly_src_dir}/Try.cpp"
    # "${folly_src_dir}/concurrency/CacheLocality.cpp"
    "${folly_src_dir}/concurrency/DeadlockDetector.cpp"
    "${folly_src_dir}/concurrency/QueueObserver.cpp"
    "${folly_src_dir}/detail/AsyncTrace.cpp"
    "${folly_src_dir}/detail/AtFork.cpp"
    # "${folly_src_dir}/detail/Futex.cpp"
    "${folly_src_dir}/detail/MemoryIdler.cpp"
    "${folly_src_dir}/detail/SingletonStackTrace.cpp"
    "${folly_src_dir}/detail/StaticSingletonManager.cpp"
    "${folly_src_dir}/detail/ThreadLocalDetail.cpp"
    "${folly_src_dir}/detail/UniqueInstance.cpp"
    "${folly_src_dir}/executors/CPUThreadPoolExecutor.cpp"
    "${folly_src_dir}/executors/Codel.cpp"
    "${folly_src_dir}/executors/EDFThreadPoolExecutor.cpp"
    "${folly_src_dir}/executors/ExecutorWithPriority.cpp"
    "${folly_src_dir}/executors/GlobalExecutor.cpp"
    "${folly_src_dir}/executors/GlobalThreadPoolList.cpp"
    "${folly_src_dir}/executors/IOThreadPoolDeadlockDetectorObserver.cpp"
    "${folly_src_dir}/executors/IOThreadPoolExecutor.cpp"
    "${folly_src_dir}/executors/InlineExecutor.cpp"
    "${folly_src_dir}/executors/ManualExecutor.cpp"
    "${folly_src_dir}/executors/MeteredExecutor.cpp"
    "${folly_src_dir}/executors/QueuedImmediateExecutor.cpp"
    "${folly_src_dir}/executors/SerialExecutor.cpp"
    "${folly_src_dir}/executors/StrandExecutor.cpp"
    "${folly_src_dir}/executors/ThreadPoolExecutor.cpp"
    "${folly_src_dir}/executors/ThreadedExecutor.cpp"
    "${folly_src_dir}/executors/TimedDrivableExecutor.cpp"
    "${folly_src_dir}/executors/TimekeeperScheduledExecutor.cpp"
    "${folly_src_dir}/fibers/BatchSemaphore.cpp"
    "${folly_src_dir}/fibers/Baton.cpp"
    "${folly_src_dir}/fibers/Fiber.cpp"
    "${folly_src_dir}/fibers/FiberManager.cpp"
    "${folly_src_dir}/fibers/GuardPageAllocator.cpp"
    "${folly_src_dir}/fibers/Semaphore.cpp"
    "${folly_src_dir}/fibers/SemaphoreBase.cpp"
    "${folly_src_dir}/fibers/SimpleLoopController.cpp"
    "${folly_src_dir}/futures/Barrier.cpp"
    "${folly_src_dir}/futures/Future.cpp"
    "${folly_src_dir}/futures/ManualTimekeeper.cpp"
    "${folly_src_dir}/futures/Promise.cpp"
    "${folly_src_dir}/futures/SharedPromise.cpp"
    "${folly_src_dir}/futures/ThreadWheelTimekeeper.cpp"
    "${folly_src_dir}/futures/detail/Core.cpp"
    "${folly_src_dir}/io/Cursor.cpp"
    "${folly_src_dir}/io/IOBuf.cpp"
    "${folly_src_dir}/io/IOBufQueue.cpp"
    "${folly_src_dir}/io/async/AsyncTimeout.cpp"
    "${folly_src_dir}/io/async/EventBase.cpp"
    "${folly_src_dir}/io/async/EventBaseBackendBase.cpp"
    "${folly_src_dir}/io/async/EventBaseLocal.cpp"
    "${folly_src_dir}/io/async/EventBaseManager.cpp"
    "${folly_src_dir}/io/async/EventHandler.cpp"
    "${folly_src_dir}/io/async/HHWheelTimer.cpp"
    "${folly_src_dir}/io/async/Request.cpp"
    "${folly_src_dir}/io/async/TimeoutManager.cpp"
    "${folly_src_dir}/io/async/VirtualEventBase.cpp"
    "${folly_src_dir}/lang/CString.cpp"
    "${folly_src_dir}/lang/Exception.cpp"
    "${folly_src_dir}/memory/MallctlHelper.cpp"
    "${folly_src_dir}/net/NetOps.cpp"
    "${folly_src_dir}/net/NetOpsDispatcher.cpp"
    "${folly_src_dir}/net/TcpInfo.cpp"
    "${folly_src_dir}/net/detail/SocketFileDescriptorMap.cpp"
    "${folly_src_dir}/portability/SysMembarrier.cpp"
    "${folly_src_dir}/portability/SysUio.cpp"
    "${folly_src_dir}/synchronization/AsymmetricMemoryBarrier.cpp"
    "${folly_src_dir}/synchronization/AtomicNotification.cpp"
    "${folly_src_dir}/synchronization/DistributedMutex.cpp"
    "${folly_src_dir}/synchronization/Hazptr.cpp"
    "${folly_src_dir}/synchronization/HazptrThreadPoolExecutor.cpp"
    # "${folly_src_dir}/synchronization/ParkingLot.cpp"
    "${folly_src_dir}/synchronization/Rcu.cpp"
    "${folly_src_dir}/synchronization/SanitizeThread.cpp"
    "${folly_src_dir}/synchronization/WaitOptions.cpp"
    "${folly_src_dir}/synchronization/detail/Hardware.cpp"
    "${folly_src_dir}/synchronization/detail/Sleeper.cpp"
    "${folly_src_dir}/system/HardwareConcurrency.cpp"
    "${folly_src_dir}/system/Pid.cpp"
    # "${folly_src_dir}/system/ThreadId.cpp"
    "${folly_src_dir}/system/ThreadName.cpp"
    "${folly_src_dir}/tracing/AsyncStack.cpp"
)
target_link_libraries(folly_futures libevent)

# HERMES
add_library(hermes-engine::libhermes SHARED IMPORTED)
set(hermes_include_dirs
    "${third_party_dir}/hermes/API"
    "${third_party_dir}/hermes/public"
)
set_property(TARGET hermes-engine::libhermes PROPERTY
                IMPORTED_LOCATION "${third_party_dir}/prebuilt/${OHOS_ARCH}/libhermes.so")

# -------- REACT COMMON --------
set(REACT_COMMON_DIR "${CMAKE_CURRENT_SOURCE_DIR}/ReactCommon")
add_library(folly_runtime ALIAS folly_target)
add_library(glog ALIAS glog_target)

# dummy targets added to avoid modyfing CMakeLists located in ReactCommon
add_library(boost INTERFACE)
add_library(log INTERFACE)
add_library(glog_init INTERFACE)
add_library(android INTERFACE)
add_library(fb INTERFACE)
add_library(fbjni INTERFACE)
add_library(reactnativejni INTERFACE)


function(add_react_common_subdir relative_path)
  add_subdirectory(${REACT_COMMON_DIR}/${relative_path})
endfunction()

add_react_common_subdir(yoga)
add_library(yoga ALIAS yogacore)
add_react_common_subdir(runtimeexecutor)
add_react_common_subdir(reactperflogger)
add_react_common_subdir(logger)
add_react_common_subdir(jsiexecutor)
add_react_common_subdir(cxxreact)
# add_react_common_subdir(jsc)
add_react_common_subdir(jsi)
add_react_common_subdir(butter)
add_react_common_subdir(callinvoker)
add_react_common_subdir(jsinspector)
add_react_common_subdir(hermes/executor)
target_include_directories(hermes_executor_common PRIVATE
    "${folly_include_dir}"
    "${boost_include_dirs}"
    "${hermes_include_dirs}"
)
# add_react_common_subdir(hermes/inspector)
add_react_common_subdir(react/renderer/runtimescheduler)
add_react_common_subdir(react/debug)
add_react_common_subdir(react/config)
add_react_common_subdir(react/renderer/animations)
add_react_common_subdir(react/renderer/attributedstring)
add_react_common_subdir(react/renderer/componentregistry)
add_react_common_subdir(react/renderer/mounting)
add_react_common_subdir(react/renderer/scheduler)
add_react_common_subdir(react/renderer/telemetry)
add_react_common_subdir(react/renderer/templateprocessor)
add_react_common_subdir(react/renderer/uimanager)
add_react_common_subdir(react/renderer/core)
add_react_common_subdir(react/renderer/graphics)
add_react_common_subdir(react/renderer/debug)
add_react_common_subdir(react/renderer/imagemanager)
add_react_common_subdir(react/renderer/components/view)
# add_react_common_subdir(react/renderer/components/switch)
# add_react_common_subdir(react/renderer/components/textinput)
# add_react_common_subdir(react/renderer/components/progressbar)
add_react_common_subdir(react/renderer/components/root)
# add_react_common_subdir(react/renderer/components/image)
# add_react_common_subdir(react/renderer/components/legacyviewmanagerinterop)
# add_react_common_subdir(react/renderer/componentregistry/native)
# add_react_common_subdir(react/renderer/components/text)
# add_react_common_subdir(react/renderer/components/unimplementedview)
# add_react_common_subdir(react/renderer/components/modal)
# add_react_common_subdir(react/renderer/components/scrollview)
add_react_common_subdir(react/renderer/leakchecker)
# add_react_common_subdir(react/renderer/textlayoutmanager)
add_react_common_subdir(react/utils)
add_react_common_subdir(react/bridging)
add_react_common_subdir(react/renderer/mapbuffer)
add_react_common_subdir(react/nativemodule/core)
target_include_directories(react_nativemodule_core PRIVATE "${REACT_COMMON_DIR}/callinvoker")

# HERMES INSPECTOR
add_subdirectory("${REACT_COMMON_DIR}/hermes/inspector")
target_include_directories(hermes_inspector PRIVATE
    "${folly_include_dir}"
    "${boost_include_dirs}"
    "${hermes_include_dirs}"
    "${libevent_include_dirs}"
)
target_compile_options(hermes_inspector PRIVATE ${folly_compile_options})

# ----------------------------------------------------------------------------------------------------------------------

add_library(rnoh SHARED
    "${CMAKE_CURRENT_SOURCE_DIR}/RNOHInstance.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/RNOHMessageQueueThread.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/RNOHLogSink.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/rnoh_napi.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/ArkJS.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/mounting/MountingManager.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/TaskExecutor/TaskExecutor.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/TaskExecutor/TaskRunner.cpp"
)
target_include_directories(rnoh PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}"
    "${REACT_COMMON_DIR}"
    "${REACT_COMMON_DIR}/jsiexecutor"
    "${folly_include_dir}"
    "${hermes_include_dirs}"
)
target_link_libraries(rnoh PUBLIC
    libace_napi.z.so
    libhilog_ndk.z.so
    uv
    Boost::context
    reactnative
    react_render_scheduler
    hermes_executor_common
)
target_compile_options(rnoh PRIVATE ${folly_compile_options} -std=c++17)

