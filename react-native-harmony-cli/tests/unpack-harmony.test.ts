import { ReactNativeFixture } from './ReactNativeFixture';
import { buildDirTree, createFileStructure } from './fsUtils';
import tmp from 'tmp';
import pathUtils from 'path';
import fse from 'fs-extra';

let tmpDir: string = '';
let removeTmpDir = () => {};

beforeEach(async () => {
  const dir = tmp.dirSync();
  tmpDir = dir.name;
  removeTmpDir = dir.removeCallback;
});

afterEach(() => {
  if (expect.getState().assertionCalls != expect.getState().numPassingAsserts)
    console.log(buildDirTree(tmpDir));
});

it('should pack and unpack package', () => {
  createFileStructure(tmpDir, {
    'react-native-harmony': {
      harmony: {
        '.tarignore': 'ignored/',
        'file.txt': 'file',
        ignored: {
          'ignored.txt': 'ignored',
        },
      },
    },
    tester: {
      harmony: {
        rnoh: {
          '.tarignore': 'ignored/',
          'file.txt': 'file',
          ignored: {
            'ignored.txt': 'ignored',
          },
        },
      },
    },
    'rn-project': {
      harmony: {},
      node_modules: {},
    },
  });
  const rnFixture = new ReactNativeFixture(tmpDir);

  rnFixture.packHarmony({
    harmonyDirPath: 'react-native-harmony/harmony',
    ohModulePath: 'tester/harmony/rnoh',
  });
  fse.copySync(
    pathUtils.join(tmpDir, 'react-native-harmony', 'harmony.tar.gz'),
    pathUtils.join(
      tmpDir,
      'rn-project',
      'node_modules',
      'react-native-harmony',
      'harmony.tar.gz'
    )
  );

  rnFixture.unpackHarmony({
    nodeModulesPath: 'rn-project/node_modules',
    outputDir: 'rn-project/harmony',
  });

  expect(
    fse.existsSync(pathUtils.join(tmpDir, 'rn-project/harmony/rnoh/file.txt'))
  ).toBeTruthy();
  expect(
    fse.existsSync(
      pathUtils.join(tmpDir, 'rn-project/harmony/rnoh/ignored/ignored.txt')
    )
  ).toBeFalsy();
  expect(
    fse.existsSync(
      pathUtils.join(
        tmpDir,
        'rn-project/node_modules/react-native-harmony/harmony/file.txt'
      )
    )
  ).toBeTruthy();
  expect(
    fse.existsSync(
      pathUtils.join(
        tmpDir,
        'rn-project/node_modules/react-native-harmony/harmony/ignored/ignored.txt'
      )
    )
  ).toBeFalsy();
});
