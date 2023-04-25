/* eslint-disable prettier/prettier */
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

function main(jsBundleRelPath, headerFileRelPath, assetSrcPath, assetsDestPath) {
  createHeaderFile(path.resolve(jsBundleRelPath), path.resolve(headerFileRelPath));
  copyAssets(path.resolve(assetSrcPath), path.resolve(assetsDestPath));
}

function copyAssets(srcPath, destPath) {
  fse.copySync(srcPath, destPath, { overwrite: true });
  console.log("Copied assets");
}

function createHeaderFile(jsBundlePath, headerFilePath) {
  const jsBundle = fs.readFileSync(jsBundlePath, 'utf8');
  const content = generateHeaderContent(jsBundle);
  fs.writeFileSync(headerFilePath, content, 'utf8');
  console.log("Created jsbundle.h");
};

function generateHeaderContent(jsBundle) {
  return `#pragma once
#include <string>

constexpr const char *JS_BUNDLE = R"JSBUNDLE(${jsBundle})JSBUNDLE";`;
};

main(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);