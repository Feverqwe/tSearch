import assert from 'node:assert/strict';
import {test} from 'node:test';

import normalize from '../exKitRequestOptionsNormalize.ts';

test('tracker query parameters remain in the request when the address has a fragment', () => {
  for (const address of [
    'https://tracker.test/search#results',
    'https://tracker.test/search?all=1#results',
  ]) {
    const {options} = normalize({url: address, query: 'q=%D1&limit=10'});
    const result = new URL(options.url);
    assert.equal(result.searchParams.get('limit'), '10');
    assert.match(result.search, /[?&]q=%D1&/);
    assert.equal(result.searchParams.get('all'), new URL(address).searchParams.get('all'));
    assert.equal(result.hash, '#results');
  }
});
