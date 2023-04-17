import React from 'react';
import { View, StyleSheet, Image, TextInput, Text } from 'react-native';
import SampleTurboModule from './SampleTurboModule';
import { PlatformConstantsTestSuite } from './tests';
import { Tester } from './components';

function App() {
  const [username, setUsername] = React.useState("");
  const [consoleOutput, setConsoleOutput] = React.useState("");

  return (
    <View style={styles.container}>
      <View style={styles.console}>
        <Text style={{ width: "100%", height: "100%", color: "white" }}>
          {consoleOutput}
        </Text>
      </View>
      <Tester>
        <PlatformConstantsTestSuite />
      </Tester>
      <View
        style={styles.button}
        onTouchStart={() => {
          const results = [];
          results.push("SampleTurboModule>");
          results.push(`voidFunc: ${SampleTurboModule?.voidFunc()}`);
          results.push(`getBool: ${SampleTurboModule?.getBool(true)}`);
          results.push(`getNull: ${SampleTurboModule?.getNull(null)}`);
          results.push(`getObject: ${JSON.stringify(SampleTurboModule?.getObject({ x: { y: 1 } }))}`);
          results.push(`getArray: ${SampleTurboModule?.getArray([1, 2, 3])}`);
          results.push(`registerFunction`);
          results.push(`doAsyncJob`);
          setConsoleOutput(results.join(" "));
          SampleTurboModule?.registerFunction((value) => {
            setConsoleOutput(prev => prev += ` Callback called with: ${value}`);
          });
          SampleTurboModule?.doAsyncJob(true).then((value) => {
            setConsoleOutput(prev => prev += ` Promise resolved with: ${value}`);
          });
          SampleTurboModule?.doAsyncJob(false).catch((err) => {
            setConsoleOutput(prev => prev += ` Promise rejected with: ${err.message}`);
          });

        }}
      >
        <Text style={styles.buttonText}>Run Turbo module</Text>
      </View>
      <UserInfo avatar="https://i.pravatar.cc/100?img=8" />
      <View style={styles.centerX}>
        <Chessboard />
      </View>
      <UserInfo name={username} avatar="https://i.pravatar.cc/100?img=31" />
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Your username</Text>
        <TextInput style={styles.textInput} onChangeText={setUsername} />
      </View>
    </View>
  );
}

function UserInfo({ name, avatar }: any) {
  return (
    <View style={styles.userInfoContainer}>
      <Image style={styles.placeholder} source={{ uri: avatar }} />
      <Text style={styles.username}>{name || 'Guest'}</Text>
    </View>
  );
}

const STATE = [
  [null, 'KNIGHT_DARK', null, null, null, null, 'KNIGHT_DARK', null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, 'KNIGHT_LIGHT', null, null, null, null, 'KNIGHT_LIGHT', null],
] as const;

const PIECE_IMAGE_URI_BY_NAME = {
  KNIGHT_LIGHT:
    'https://raw.githubusercontent.com/kasperski95/images/master/reanimated-light.png',
  KNIGHT_DARK:
    'https://raw.githubusercontent.com/kasperski95/images/master/reanimated-dark.png',
};

function Chessboard() {
  const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];
  rows.reverse();
  const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <View style={styles.chessboardContainer}>
      {rows.map((rowLabel, rowIndex) => (
        <View style={styles.row}>
          {cols.map((colLabel, colIndex) => {
            const pieceNameMaybe = STATE[rowIndex][colIndex];

            return (
              <ChessboardCell
                topLeftText={colIndex === 0 ? rowLabel : undefined}
                bottomRightText={rowIndex === 7 ? colLabel : undefined}
                variant={(rowIndex + colIndex) % 2 ? 'light' : 'dark'}>
                {pieceNameMaybe && (
                  <Image
                    style={styles.pieceImage}
                    source={{
                      uri: PIECE_IMAGE_URI_BY_NAME[pieceNameMaybe],
                    }}
                  />
                )}
              </ChessboardCell>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_BG_COLOR_BY_VARIANT = {
  light: { inactive: 'hsl(62, 42%, 87%)', active: 'hsl(60, 88%, 73%)' },
  dark: { inactive: 'hsl(89, 27%, 46%)', active: 'hsl(67, 58%, 52%)' },
} as const;

function ChessboardCell({
  variant,
  children,
  topLeftText,
  bottomRightText,
}: {
  variant: 'light' | 'dark';
  children: any;
  topLeftText?: string;
  bottomRightText?: string;
}) {
  const [isSelected, setIsSelected] = React.useState(false);
  const oppositeVariant = variant === 'light' ? 'dark' : 'light';
  return (
    <View
      onTouchStart={() => {
        setIsSelected(prev => !prev);
      }}
      style={[
        styles.cell,
        {
          backgroundColor:
            CELL_BG_COLOR_BY_VARIANT[variant][
            isSelected ? 'active' : 'inactive'
            ],
        },
      ]}>
      <Text
        style={[
          styles.cornerText,
          {
            top: 4,
            left: 4,
            color: CELL_BG_COLOR_BY_VARIANT[oppositeVariant].inactive,
          },
        ]}>
        {topLeftText}
      </Text>
      <Text
        style={[
          styles.cornerText,
          {
            bottom: 4,
            right: 4,
            textAlign: 'right',
            textAlignVertical: 'bottom',
            color: CELL_BG_COLOR_BY_VARIANT[oppositeVariant].inactive,
          },
        ]}>
        {bottomRightText}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  centerX: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  chessboardContainer: {
    width: 400,
    height: 400,
    borderWidth: 1,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '12.5%',
  },
  cell: {
    width: '12.5%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceImage: {
    width: '90%',
    height: '90%',
    backgroundColor: 'rgba(255,255,255,0)', // hotfix
  },
  detailContainer: {
    padding: 8,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    width: '100%', // hack
    height: 20, // hack
  },
  label: {
    color: 'silver',
    width: '100%', // hack
    height: 20, // hack
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'silver',
    backgroundColor: '#444',
    height: 32, // hack
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    fontSize: 16,
    color: 'white',
  },
  placeholder: {
    backgroundColor: 'gray',
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'silver',
  },
  userInfoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  gutter: {
    width: 4,
    height: 4,
  },
  cornerText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: 'bold',
    width: 12, // hack
    height: 12, // hack
  },
  button: {
    width: 160,
    height: 36,
    backgroundColor: 'hsl(190, 50%, 70%)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    width: '100%',
    height: '100%',
    fontWeight: 'bold',
  },
  console: {
    width: "100%",
    height: 100,
    backgroundColor: "black",
    padding: 8
  }
});

export default App;
