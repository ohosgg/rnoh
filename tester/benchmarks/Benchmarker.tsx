import {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

export function Benchmarker({
  samplesCount,
  renderContent,
}: {
  renderContent: (refreshKey: number) => any;
  samplesCount: number;
}) {
  const [status, setStatus] = useState<'READY' | 'RUNNING' | 'FINISHED'>(
    'READY',
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [_startDateTime, setStartDateTime] = useState<Date>();
  const [_endDateTime, setEndDateTime] = useState<Date>();

  function start() {
    setStartDateTime(new Date());
    setStatus('RUNNING');
    setRefreshKey(0);
  }

  useEffect(() => {
    if (status === 'READY') {
      return;
    }
    setTimeout(() => {
      setRefreshKey(prevKey => {
        if (prevKey >= samplesCount) {
          setStatus('FINISHED');
          setEndDateTime(new Date());
          return prevKey;
        }
        setStatus('RUNNING');
        return prevKey + 1;
      });
    }, 0);
  }, [refreshKey, status, samplesCount]);

  return (
    <View style={{height: '100%', padding: 16}}>
      <TouchableOpacity onPress={start}>
        <Text
          style={{
            width: 200,
            height: 32,
            fontWeight: 'bold',
            color: status !== 'RUNNING' ? 'blue' : 'black',
          }}>
          {status === 'RUNNING' ? 'Running...' : 'Start'}
        </Text>
      </TouchableOpacity>

      {/* <View
        style={{opacity: status === 'FINISHED' && durationInMs > 0 ? 1 : 0}}>
        <Text style={{width: 128, height: 32}}>Duration {durationInMs} ms</Text>
      </View> */}

      {status !== 'READY' && (
        <View style={{height: 600}}>{renderContent(refreshKey)}</View>
      )}
    </View>
  );
}
