import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
  inferDateFormat,
  inferSizeFormat,
} from '../../../packages/tracker-toolkit/src/value-formats.ts';
import {dateFormat, todayReplace} from '../exKitLegacyFn.ts';
import {checkPipelineStep, compilePipeline} from '../trackerPipeline.ts';

test('pipeline executes in stored order and identifies the failing transformation', async () => {
  const convert = await compilePipeline([{name: 'replace', args: [',', '.']}, {name: 'toFloat'}]);
  assert.equal(convert(' 2,5 '), 2.5);
  const badOrder = await compilePipeline([{name: 'toFloat'}, {name: 'replace', args: [',', '.']}]);
  assert.throws(() => badOrder('2,5'), {message: /2\. replace:/, step: 1});
  await assert.rejects(compilePipeline([{name: 'getText'}, {name: 'replaceRe', args: ['[', '']}]), {
    message: /2\. replaceRe:/,
    step: 1,
  });
  assert.equal(await checkPipelineStep({name: 'replaceRe', args: ['[', '']}), 'Pattern');
  assert.equal(await checkPipelineStep({name: 'getChild', args: ['']}), 'Index');
});

test('a generated size pipeline reads rows with explicit bytes and larger units together', async () => {
  const {pipeline} = inferSizeFormat(['1 024 байта', '512 B', '1.5 MiB']);
  assert.ok(pipeline);
  const convert = await compilePipeline(pipeline);
  assert.equal(convert('1 024 байта'), 1024);
  assert.equal(convert('512 B'), 512);
  assert.equal(convert('1.5 MiB'), 1.5 * 1024 ** 2);
});

test('formatted dates use the same Unix seconds as ISO dates and the search result formatter', async () => {
  const convert = await compilePipeline([{name: 'parseDate', args: ['YYYY-MM-DD HH:mm']}]);
  assert.equal(convert('2026-04-17 14:20'), new Date(2026, 3, 17, 14, 20).getTime() / 1000);
});

test('one inferred timestamp pipeline reads both seconds and milliseconds from the same column', async () => {
  const {pipeline} = inferDateFormat(['1763395200', '1763395200123']);
  assert.ok(pipeline);
  const convert = await compilePipeline(pipeline);
  assert.equal(convert('1763395200'), 1763395200);
  assert.equal(convert('1763395200123'), 1763395200);
});

test('yesterday is the previous local calendar date across the start of daylight saving', (t) => {
  const timezone = process.env.TZ;
  process.env.TZ = 'America/New_York';
  t.after(() => {
    if (timezone === undefined) delete process.env.TZ;
    else process.env.TZ = timezone;
  });
  t.mock.timers.enable({apis: ['Date'], now: Date.parse('2026-03-09T00:30:00-04:00')});
  assert.equal(
    dateFormat(0, todayReplace('yesterday 08:00', '0')),
    new Date(2026, 2, 8, 8).getTime() / 1000,
  );
});
