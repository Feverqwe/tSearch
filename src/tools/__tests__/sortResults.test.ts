import assert from 'node:assert/strict';
import {test} from 'node:test';

import sortResults from '../sortResults.ts';

test('results compare raw numbers by priority and preserve order for ties', () => {
  const rows = [
    {id: 'A', quality: 20, seeds: 5},
    {id: 'B', quality: 4, seeds: 11},
    {id: 'C', quality: 20, seeds: 11},
    {id: 'D', quality: 20, seeds: 11},
  ];
  assert.deepEqual(
    sortResults(rows, [
      {by: 'quality', direction: 0},
      {by: 'seeds', direction: 0},
    ]).map(({id}) => id),
    ['C', 'D', 'A', 'B'],
  );
});

test('missing seed counts follow known values in either direction and use secondary sorting', () => {
  const rows = [
    {id: 'few', seeds: 0, quality: 10},
    {id: 'missing', quality: 10},
    {id: 'many', seeds: 5, quality: 10},
    {id: 'unknown', seeds: NaN, quality: 20},
  ];
  const ordered = (direction: number) =>
    sortResults(
      [...rows],
      [
        {by: 'seeds', direction},
        {by: 'quality', direction: 0},
      ],
    ).map(({id}) => id);
  assert.deepEqual(ordered(0), ['many', 'few', 'unknown', 'missing']);
  assert.deepEqual(ordered(1), ['few', 'many', 'unknown', 'missing']);
});
