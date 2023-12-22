import tmp from 'tmp';
import { ReactNativeFixture } from './ReactNativeFixture';
import pathUtils from 'path';
import fs from 'fs';
import { createFileStructure } from './fsUtils';

let tmpDir: string = '';
let removeTmpDir = () => {};

beforeEach(async () => {
  const dir = tmp.dirSync();
  tmpDir = dir.name;
  removeTmpDir = dir.removeCallback;
});

afterEach(removeTmpDir);

it('should generate MetroHostConfig.ts', async () => {
  createFileStructure(tmpDir, {
    foo: {},
  });

  new ReactNativeFixture(tmpDir).createMetroHostConstantsHarmony({
    output: 'foo/MetroHostConfig.ts',
  });

  expect(
    fs
      .readFileSync(pathUtils.join(tmpDir, 'foo', 'MetroHostConfig.ts'))
      .includes('METRO_SERVER_IP')
  ).toBeTruthy();
});
