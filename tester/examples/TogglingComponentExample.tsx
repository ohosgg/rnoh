import {useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {randomizeColor} from '../components';

export function TogglingComponentExample() {
  const [isComponentVisible, setIsComponentVisible] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setIsComponentVisible(prev => !prev);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <ScrollView style={{flex: 1, width: '100%'}}>
        {new Array(100).fill(0).map((_, id) => {
          return <Item key={id} id={id} width={'100%'} />;
        })}
      </ScrollView>
      <View style={{flex: 1, width: '100%'}}>
        {isComponentVisible &&
          new Array(500).fill(0).map((_, id) => {
            return <Item2 key={id} id={id} width={100} />;
          })}
      </View>
    </View>
  );
}

function Item(props: {id: number; width: any}) {
  const [color] = useState(randomizeColor());

  return (
    <View style={{width: props.width, height: 100, backgroundColor: color}}>
      <Text style={{height: 24, width: '100%'}}>{props.id}</Text>
    </View>
  );
}

function Item2(props: {id: number; width: any}) {
  const [color] = useState(randomizeColor());

  return (
    <View
      style={{
        width: props.width,
        height: 100,
        backgroundColor: color,
        position: 'absolute',
        top: Math.random() * 200,
        left: Math.random() * 200,
        borderWidth: 1,
      }}
    />
  );
}
