import {Image, Text} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import {Modal, StateKeeper} from '../components';

const LOCAL_IMAGE_ASSET_ID = require('../assets/pravatar-131.jpg');
const REMOTE_IMAGE_URL = 'https://i.pravatar.cc/100?img=31';

export const ImageTest = () => {
  return (
    <>
      <TestSuite name="Image">
        <TestCase itShould="support loading local images">
          <Image
            style={{borderRadius: 8, borderWidth: 1}}
            source={LOCAL_IMAGE_ASSET_ID}
          />
        </TestCase>
        <TestCase
          itShould="retrieve remote image size"
          fn={({expect}) => {
            return new Promise((resolve, reject) => {
              Image.getSize(
                REMOTE_IMAGE_URL,
                (width, height) => {
                  expect(width).to.be.eq(100);
                  expect(height).to.be.eq(100);
                  resolve();
                },
                e => {
                  reject(e);
                },
              );
            });
          }}
        />
        <TestCase
          itShould="retrieve local image size"
          fn={({expect}) => {
            const resolvedAsset =
              Image.resolveAssetSource(LOCAL_IMAGE_ASSET_ID);
            expect(resolvedAsset.width).to.be.eq(150);
            expect(resolvedAsset.height).to.be.eq(150);
          }}
        />
        <TestCase
          itShould="[FAILS] prefetch image" // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/206
          fn={async ({expect}) => {
            let ex: any;
            try {
              await Image.prefetch('not_image');
            } catch (e) {
              ex = e;
            }
            expect(ex).to.be.not.undefined;
            expect(await Image.prefetch(REMOTE_IMAGE_URL)).to.be.true;
            expect(await Image.prefetch(REMOTE_IMAGE_URL)).to.be.true;
          }}
        />
        <TestCase
          itShould="[FAILS] render circular image on a red rectangle (overlayColor)" // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/246
        >
          <Image
            source={LOCAL_IMAGE_ASSET_ID}
            style={{overlayColor: 'red', borderRadius: Number.MAX_SAFE_INTEGER}}
          />
        </TestCase>
        <TestCase
          itShould="[FAILS] call onLoadStart" // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/244
        >
          <StateKeeper
            initialValue={'not called'}
            renderContent={(value, setValue) => {
              return (
                <Modal>
                  <Image
                    source={{uri: REMOTE_IMAGE_URL, width: 100, height: 100}}
                    onLoadStart={() => setValue('onLoadStart called')}
                  />
                  <Text style={{height: 16}}>{value}</Text>
                </Modal>
              );
            }}
          />
        </TestCase>
      </TestSuite>
      <TestSuite
        name="Image resizeMode" // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/245
      >
        <TestCase itShould="[FAILS] render small image in the center (center)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="center"
          />
        </TestCase>
        <TestCase itShould="[FAILS] render image touching top and bottom edges in the center (contain)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="contain"
          />
        </TestCase>
        <TestCase itShould="fully cover test case area while preserving aspect ratio (cover)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="cover"
          />
        </TestCase>
        <TestCase itShould="[FAILS] cover test case area by repeating image (repeat)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="repeat"
          />
        </TestCase>
        <TestCase itShould="[FAILS] cover test case area by stretching (stretch)">
          <Image
            style={{width: '100%', height: 100}}
            source={LOCAL_IMAGE_ASSET_ID}
            resizeMode="stretch"
          />
        </TestCase>
      </TestSuite>
    </>
  );
};
