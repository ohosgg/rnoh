import {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

export function Benchmarker({
  samplesCount,
  children,
}: {
  children: any;
  samplesCount: number;
}) {
  const [status, setStatus] = useState<'READY' | 'RUNNING' | 'FINISHED'>(
    'READY',
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [startDateTime, setStartDateTime] = useState<Date>();
  const [endDateTime, setEndDateTime] = useState<Date>();

  function start() {
    setStartDateTime(new Date());
    setStatus('RUNNING');
    setRefreshKey(0);
  }

  useEffect(() => {
    if (status === 'READY') return;
    setTimeout(() => {
      setRefreshKey(prevKey => {
        if (prevKey >= samplesCount * 2) {
          setStatus('FINISHED');
          setEndDateTime(new Date());
          return prevKey;
        }
        setStatus('RUNNING');
        return prevKey + 1;
      });
    }, 0);
  }, [refreshKey, status, samplesCount]);

  const durationInMs =
    endDateTime && startDateTime
      ? endDateTime.getTime() - startDateTime.getTime()
      : 0;

  return (
    <View style={{height: '100%', padding: 16}}>
      <TouchableOpacity onPress={start}>
        <Text
          style={{width: 128, height: 32, fontWeight: 'bold', color: 'blue'}}>
          {status === 'RUNNING'
            ? 'Running...'
            : `Start (${samplesCount} samples)`}
        </Text>
      </TouchableOpacity>
      {status === 'FINISHED' && durationInMs > 0 && (
        <Text style={{width: 128, height: 32}}>Duration {durationInMs} ms</Text>
      )}
      {status !== 'READY' && (
        <View style={{height: 600}}>
          {refreshKey % 2 === 0 ? children : null}
        </View>
      )}
    </View>
  );
}
