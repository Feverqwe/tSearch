import assert from 'node:assert/strict';
import {test} from 'node:test';

import {readTitlePresentation, titleSpans} from '../titlePresentation.ts';

test('all bracket types survive as text and a match retains the inner style', () => {
  const title = 'Я (версия [Sintel]) {🎬} <1080p>';
  const start = title.indexOf('Sintel');
  const spans = titleSpans(title, [{start, end: start + 'Sintel'.length}]);
  assert.equal(spans.map(({text}) => text).join(''), title);
  assert.deepEqual(
    spans.find(({match}) => match),
    {text: 'Sintel', bracket: '[', match: true},
  );
  assert.deepEqual(
    [...new Set(spans.map(({bracket}) => bracket).filter(Boolean))],
    ['(', '[', '{', '<'],
  );
  assert.equal(spans.find(({text}) => text === ')')?.bracket, '(');
});

test('unpaired bracket marks remain plain and do not swallow valid groups', () => {
  const spans = titleSpans('Broken (name [1080p] }', []);
  assert.deepEqual(
    spans.map(({text, bracket}) => [text, bracket]),
    [
      ['Broken (name ', undefined],
      ['[1080p]', '['],
      [' }', undefined],
    ],
  );
});

test('old settings keep the built-in presentation and a partial version keeps saved choices', () => {
  const baseline = readTitlePresentation({highlight: false});
  const migrated = readTitlePresentation({
    version: 1,
    highlight: false,
    brackets: {'[': 'accent', '{': 'invalid'},
  });
  assert.equal(migrated.highlight, false);
  assert.equal(migrated.brackets['['], 'accent');
  assert.equal(migrated.brackets['{'], baseline.brackets['{']);
  assert.equal(baseline.highlight, true);
});
