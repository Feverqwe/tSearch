import assert from 'node:assert/strict';
import {test} from 'node:test';

import Transport from '../transport.ts';

test('a result that cannot cross the frame boundary rejects the call and leaves later calls usable', async () => {
  let callerReceive: (message: unknown) => void;
  let workerReceive: (message: unknown) => void;
  const caller = new Transport(
    {
      onMessage: (receive) => (callerReceive = receive),
      postMessage: (message) => workerReceive(structuredClone(message)),
    },
    {},
  );
  const worker = new Transport(
    {
      onMessage: (receive) => (workerReceive = receive),
      postMessage: (message) => callerReceive(structuredClone(message)),
    },
    {invalid: () => () => 'a function', valid: () => ['a result']},
  );
  try {
    await assert.rejects(caller.callFn('invalid'), {name: 'DataCloneError'});
    assert.deepEqual(await caller.callFn('valid'), ['a result']);
  } finally {
    caller.destroy();
    worker.destroy();
  }
});
