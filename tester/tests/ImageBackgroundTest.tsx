import {TestCase, TestSuite} from '@rnoh/testerino';
import {ImageBackground, Text} from 'react-native';

const LOCAL_IMAGE_ASSET_ID = require('../assets/pravatar-131.jpg');

export const ImageBackgroundTest = () => {
  return (
    <TestSuite name="ImageBackground">
      <TestCase itShould="show centered text on image background with red border">
        <ImageBackground
          source={LOCAL_IMAGE_ASSET_ID}
          style={{width: '100%', height: 100, justifyContent: 'center'}}
          imageStyle={{borderWidth: 4, borderRadius: 50, borderColor: 'red'}}
          resizeMode="cover">
          <Text
            style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              textAlign: 'center',
            }}>
            Image background
          </Text>
        </ImageBackground>
      </TestCase>
    </TestSuite>
  );
};
