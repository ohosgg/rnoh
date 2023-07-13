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
      'package.json': `{"version": "0.0.1"}`,
    },
    tester: {
      harmony: {
        rnoh: {
          '.tarignore': 'ignored/',
          'file.txt': 'file',
          ignored: {
            'ignored.txt': 'ignored',
          },
          'oh-package.json5': `{"version": "0.0.1"}`,
        },
      },
    },
    'rn-project': {
      node_modules: {},
    },
  });
  const rnFixture = new ReactNativeFixture(tmpDir);

  rnFixture.packHarmony({
    harmonyDirPath: 'react-native-harmony/harmony',
    ohModulePath: 'tester/harmony/rnoh',
    packageJSONPath: 'react-native-harmony/package.json',
  });
  fse.copySync(
    pathUtils.join(tmpDir, 'react-native-harmony'),
    pathUtils.join(tmpDir, 'rn-project', 'node_modules', 'react-native-harmony')
  );

  const unpackingResult = rnFixture.unpackHarmony({
    nodeModulesPath: 'rn-project/node_modules',
    outputDir: 'rn-project/harmony',
  });
  const unpackingAgainResult = rnFixture.unpackHarmony({
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
  expect(unpackingResult).toContain('[UNPACKING]');
  expect(unpackingAgainResult).not.toContain('[UNPACKING]');
});

it('should replace module when updating npm package', () => {
  createFileStructure(tmpDir, {
    'react-native-harmony': {
      harmony: {},
      'package.json': `{"version": "0.0.2"}`,
    },
    tester: {
      harmony: {
        rnoh: {
          'oh-package.json5': `{"version": "0.0.0"}`,
          'file.txt': 'NEW_CONTENT',
        },
      },
    },
    'rn-project': {
      harmony: {
        react_native_modules: {
          rnoh: {
            'oh-package.json5': `{"version": "0.0.1"}`,
            'file.txt': 'OLD_CONTENT',
          },
        },
      },
    },
  });
  const rnFixture = new ReactNativeFixture(tmpDir);
  rnFixture.packHarmony({
    harmonyDirPath: 'react-native-harmony/harmony',
    ohModulePath: 'tester/harmony/rnoh',
    packageJSONPath: 'react-native-harmony/package.json',
  });
  fse.copySync(
    pathUtils.join(tmpDir, 'react-native-harmony'),
    pathUtils.join(tmpDir, 'rn-project', 'node_modules', 'react-native-harmony')
  );

  rnFixture.unpackHarmony({
    nodeModulesPath: 'rn-project/node_modules',
    outputDir: 'rn-project/harmony/react_native_modules',
  });

  expect(
    fse.readFileSync(
      pathUtils.join(
        tmpDir,
        'rn-project/harmony/react_native_modules/rnoh/oh-package.json5'
      ),
      { encoding: 'utf-8' }
    )
  ).toContain('0.0.2');
  expect(
    fse.readFileSync(
      pathUtils.join(
        tmpDir,
        'rn-project/harmony/react_native_modules/rnoh/file.txt'
      ),
      { encoding: 'utf-8' }
    )
  ).toBe('NEW_CONTENT');
});
