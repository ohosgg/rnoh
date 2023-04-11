/* eslint-disable prettier/prettier */
const fs = require('fs');
const path = require('path');

const generateHeaderContent = (jsBundle) => {
  return `#pragma once
#include <string>

constexpr const char *JS_BUNDLE = R"JSBUNDLE(${jsBundle})JSBUNDLE";`;
};

const createHeaderFile = (headerFilePath, jsBundlePath) => {
  const jsBundle = fs.readFileSync(jsBundlePath, 'utf8');
  const content = generateHeaderContent(jsBundle);
  fs.writeFileSync(headerFilePath, content, 'utf8');
};

const jsBundlePath = path.resolve(process.argv[2]);
const headerFilePath = path.resolve(process.argv[3]);

createHeaderFile(headerFilePath, jsBundlePath);
