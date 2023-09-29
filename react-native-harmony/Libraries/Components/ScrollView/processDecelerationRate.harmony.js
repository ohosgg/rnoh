/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

//RNOH patch - fix return values for Platform.OS = ios

function processDecelerationRate(
  decelerationRate: number | "normal" | "fast"
): number {
  if (decelerationRate === "normal") {
    return 0.998;
  } else if (decelerationRate === "fast") {
    return 0.99;
  }
  return decelerationRate;
}

module.exports = processDecelerationRate;
