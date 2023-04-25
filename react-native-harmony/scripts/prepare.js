const fse = require('fs-extra');

fse.removeSync("./harmony");

fse.copySync("../tester/harmony/react_native_modules/rnoh", "./harmony/rnoh", {
  overwrite: true,
  filter: (src, dest) => {
    return !src.includes("node_modules") && !src.includes("build") && !src.includes(".cxx");
  },

});
