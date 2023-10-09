#!/bin/bash

if [ -z "$OHOS_SDK" ]; then
  echo "Environment variable OHOS_SDK is not defined"
  exit 1
fi

SCRIPT_DIR=$(dirname "$0")
THIRD_PARTY_DIR=$SCRIPT_DIR/../harmony/cpp/third-party
HERMES_SRC_DIR=$THIRD_PARTY_DIR/hermes

while true; do
  read -p "Did you checkout $HERMES_SRC_DIR to correct revision? (y/n): " answer
  if [[ $answer == "y" ]]; then
    break
  elif [[ $answer == "n" ]]; then
    echo "1. Find proper revision https://github.com/facebook/hermes/tags"
    echo "2. Navigate to $HERMES_SRC_DIR"
    echo "3. git checkout NEW_REVISION"
    exit 1

  else
    echo "Invalid response. Please enter 'y' or 'n'."
  fi
done

while true; do
  read -p "Did you comment out lines 619 and 632 in $HERMES_SRC_DIR/CMakeLists.txt (y/n): " answer
  if [[ $answer == "y" ]]; then
    break
  elif [[ $answer == "n" ]]; then
    echo "Comment out lines: 619 (find_package(fbjni REQUIRED CONFIG)) and 632 (add_subdirectory(android/intltest/java/com/facebook/hermes/test)"
    exit 1
  else
    echo "Invalid response. Please enter 'y' or 'n'."
  fi
done

read -p "Provide React Native version (eg. 0.0.0): " REACT_NATIVE_VERSION

ARCHITECTURES=("arm64-v8a" "armeabi-v7a" "x86_64")
OHOS_SDK_NATIVE_DIR=$OHOS_SDK/10/native
OUTPUT_DIR="$PWD/out"
BUILD_HERMESC_DIR=$OUTPUT_DIR/hermesc
JSI_DIR=$THIRD_PARTY_DIR/rn/ReactCommon/jsi

for ARCHITECTURE in "${ARCHITECTURES[@]}"; do
  echo "Building Hermes@$ARCHITECTURE"
  BUILD_TARGET_DIRECTORY=$OUTPUT_DIR/${ARCHITECTURE}-output
  BUILD_LIBRARY_DIRECTORY=$OUTPUT_DIR/${ARCHITECTURE}-lib
  $OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/cmake \
    -S$HERMES_SRC_DIR \
    -B$BUILD_HERMESC_DIR \
    -DJSI_DIR=$JSI_DIR
  $OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/cmake \
    --build $BUILD_HERMESC_DIR \
    --target hermesc -j 4

  $OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/cmake \
    -H$HERMES_SRC_DIR \
    -B$BUILD_TARGET_DIRECTORY \
    -GNinja \
    -DCMAKE_SYSTEM_NAME=OHOS \
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
    -DCMAKE_SYSTEM_VERSION=1 \
    -DOHOS_ARCH=$ARCHITECTURE \
    -DOHOS_STL=c++_shared \
    -DCMAKE_TOOLCHAIN_FILE=$OHOS_SDK_NATIVE_DIR/build/cmake/ohos.toolchain.cmake \
    -DCMAKE_MAKE_PROGRAM=$OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/ninja \
    -DCMAKE_LIBRARY_OUTPUT_DIRECTORY=$BUILD_LIBRARY_DIRECTORY \
    -DIMPORT_HERMESC=$BUILD_HERMESC_DIR/ImportHermesc.cmake \
    -DJSI_DIR=$THIRD_PARTY_DIR/rn/ReactCommon/jsi \
    -DHERMES_IS_ANDROID=True \
    -DHERMES_SLOW_DEBUG=False \
    -DHERMES_BUILD_SHARED_JSI=True \
    -DHERMES_RELEASE_VERSION="for RN $REACT_NATIVE_VERSION" \
    -DHERMES_ENABLE_INTL=False \
    -DCMAKE_BUILD_WITH_INSTALL_RPATH=On \
    -DHERMES_ENABLE_TEST_SUITE=False \
    -DHERMES_UNICODE_LITE=True \
    -DCMAKE_BUILD_TYPE=Release

  $OHOS_SDK_NATIVE_DIR/build-tools/cmake/bin/ninja \
    -C \
    $BUILD_TARGET_DIRECTORY \
    libhermes
done

for ARCHITECTURE in "${ARCHITECTURES[@]}"; do
  echo "Copying $OUTPUT_DIR/${ARCHITECTURE}-lib/libhermes.so to $THIRD_PARTY_DIR/prebuilt/$ARCHITECTURE/libhermes.so"
  cp -f "$OUTPUT_DIR/${ARCHITECTURE}-lib/libhermes.so" "$THIRD_PARTY_DIR/prebuilt/$ARCHITECTURE/libhermes.so"
done
