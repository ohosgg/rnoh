/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

/**
 * Sets up the console and exception handling (redbox) for React Native.
 * You can use this module directly, or just require InitializeCore.
 */
const ExceptionsManager = require('react-native/Libraries/Core/ExceptionsManager'); // RNOH: patch
ExceptionsManager.installConsoleErrorReporter();

global.__fbDisableExceptionsManager = true; // RNOH: patch

// Set up error handler
if (!global.__fbDisableExceptionsManager) {
  const handleError = (e: mixed, isFatal: boolean) => {
    try {
      ExceptionsManager.handleException(e, isFatal);
    } catch (ee) {
      console.log('Failed to print error: ', ee.message);
      throw e;
    }
  };

  const ErrorUtils = require('react-native/Libraries/vendor/core/ErrorUtils'); // RNOH: patch
  ErrorUtils.setGlobalHandler(handleError);
}
