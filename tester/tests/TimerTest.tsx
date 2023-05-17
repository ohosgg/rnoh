import {TestCase, TestSuite} from '@rnoh/testerino';
import React from 'react';

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
        fn={async ({expect}) => {
          await wait(1000);
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
        itShould="trigger fn every second twice (setInterval)"
        fn={async ({expect}) => {
          await wait(1000);
          let i = 0;
          const time1 = new Date().getTime();

          await new Promise(resolve => {
            setInterval(() => {
              if (i == 1) resolve(null);
              i++;
            }, 1000);
          });

          const time2 = new Date().getTime();
          expect(Math.abs(time2 - time1 - 2000)).to.be.lessThan(
            PRECISION_IN_MS,
          );
        }}
      />
    </TestSuite>
  );
}
