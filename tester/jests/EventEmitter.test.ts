import {EventEmitter} from '../harmony/rnoh/src/main/ets/RNOH/EventEmitter';

it('should listen to emitted events', async () => {
  const ee = new EventEmitter<{FOO: [string, string]}>();

  setTimeout(() => {
    ee.emit('FOO', 'bar', 'baz');
  }, 0);
  const result = await new Promise(resolve => {
    const unsubscribe = ee.subscribe('FOO', (bar, baz) => {
      resolve([bar, baz]);
      unsubscribe();
    });
  });

  expect(result).toStrictEqual(['bar', 'baz']);
});
