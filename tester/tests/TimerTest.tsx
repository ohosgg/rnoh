import {TestCase, TestSuite} from '@rnoh/testerino';
import React, {useEffect} from 'react';
import {AppState, AppStateStatus, Text} from 'react-native';
import {Button} from '../components';

async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const PRECISION_IN_MS = 100;

export function TimerTest() {
  return (
    <TestSuite name="Timer">
      <TestCase
        itShould="take three seconds to finish this test (setTimeout)"
        initialState={0}
        arrange={({setState}) => {
          return (
            <Button
              label="Start Timeout"
              onPress={() => {
                setState(prev => prev + 1);
              }}
            />
          );
        }}
        assert={async ({expect}) => {
          const waitTimeInMs = 3000;
          const time1 = new Date().getTime();
          await wait(waitTimeInMs);
          const time2 = new Date().getTime();

          expect(time1).to.be.greaterThan(0);
          expect(time2).to.be.greaterThan(0);
          expect(Math.abs(time2 - time1 - waitTimeInMs)).to.be.lessThan(
            PRECISION_IN_MS,
          );
        }}
      />
      <TestCase
        itShould="take three seconds to finish this test (setInterval)"
        initialState={0}
        arrange={({setState}) => {
          return (
            <Button
              label="Start Interval"
              onPress={() => {
                setState(prev => prev + 1);
              }}
            />
          );
        }}
        assert={async ({expect}) => {
          await wait(3000);
          let i = 0;
          const time1 = new Date().getTime();

          await new Promise(resolve => {
            setInterval(() => {
              if (i === 1) {
                resolve(null);
              }
              i++;
            }, 1000);
          });

          const time2 = new Date().getTime();
          expect(Math.abs(time2 - time1 - 2000)).to.be.lessThan(
            PRECISION_IN_MS,
          );
        }}
      />
      <TestCase<{date: Date; appStateStatus: AppStateStatus}[]>
        modal
        itShould="not trigger updates when the application is in background"
        initialState={[]}
        arrange={({state, setState}) => {
          return (
            <Effect
              onEffect={() => {
                const interval = setInterval(() => {
                  setState(prev => [
                    ...prev,
                    {
                      date: new Date(),
                      appStateStatus: AppState.currentState,
                    },
                  ]);
                }, 1000);
                return () => clearInterval(interval);
              }}>
              <Text>
                {JSON.stringify(
                  state.reduce(
                    (acc, tick) => {
                      return {
                        ...acc,
                        [tick.appStateStatus]: acc[tick.appStateStatus] + 1,
                      };
                    },
                    {
                      active: 0,
                      background: 0,
                      extension: 0,
                      inactive: 0,
                      unknown: 0,
                    } as Record<AppStateStatus, number>,
                  ),
                )}
              </Text>
            </Effect>
          );
        }}
        assert={({expect, state}) => {
          expect(
            state.filter(tick => tick.appStateStatus !== 'active').length,
          ).to.be.eq(0);
        }}
      />
    </TestSuite>
  );
}

function Effect({
  onEffect,
  children,
}: {
  onEffect: () => void | (() => void);
  children: any;
}) {
  useEffect(onEffect, []);
  return children;
}
