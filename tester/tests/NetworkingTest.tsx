import {StyleSheet, Text, View} from 'react-native';
import {TestCase, TestSuite} from '@rnoh/testerino';
import React from 'react';
import {Effect} from '../components';

const WebSocketEcho = () => {
  const [status, setStatus] = React.useState('Loading...');
  const [data, setData] = React.useState<string>();

  const runWebSockSession = () => {
    // connect to Postman's echo server
    var ws = new WebSocket('wss://ws.postman-echo.com/raw');

    ws.onopen = () => {
      setStatus('Connected');
      ws.send('something');
    };

    ws.onmessage = e => {
      setData(JSON.stringify(e));
      setTimeout(() => {
        setStatus('Closing...');
        ws.close();
      }, 3000);
    };

    ws.onerror = e => {
      console.error(e.message);
      setStatus(`Error ${e.message}`);
    };

    ws.onclose = e => {
      console.log(e.code, e.reason);
      setStatus(`Closed ${e.code} ${e.reason}`);
    };
  };

  React.useEffect(() => {
    runWebSockSession();
  }, []);

  return (
    <View>
      <Text style={styles.loadingText}>{status}</Text>
      {data && <Text style={styles.movieDetails}>{data}</Text>}
    </View>
  );
};

export const NetworkingTest = () => {
  const canFetch = async (url: string) => {
    try {
      const response = await fetch(url);
      const _result = await response.json();
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <TestSuite name="Networking">
      <TestCase
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/356
        itShould="download data"
        fn={async ({expect}) => {
          const response = await fetch('https://reactnative.dev/movies.json');
          const result = await response.json();
          expect(result['title']).to.be.eq('The Basics - Networking');
        }}
      />
      <TestCase
        skip // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/356
        itShould="fail on bad url"
        fn={async ({expect}) => {
          const received = await canFetch(
            'https://reactnative.dev/bad_url.json',
          );
          expect(received).to.be.false;
        }}
      />
      <TestCase itShould="connect to websocks">
        <WebSocketEcho />
      </TestCase>
    </TestSuite>
  );
};

const styles = StyleSheet.create({
  movieDetails: {
    height: 20,
    width: '100%',
  },
  loadingText: {
    fontSize: 20,
    height: 40,
    width: '100%',
  },
});
