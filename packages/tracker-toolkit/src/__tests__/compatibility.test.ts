import assert from 'node:assert/strict';
import {test} from 'node:test';

import {assertPortableRules} from '../compatibility.ts';

test('tracker generation accepts existing ExKit rules and rejects an HTML research operation', () => {
  assert.doesNotThrow(() =>
    assertPortableRules({
      row: {selector: 'article'},
      size: {selector: '.size', pipeline: [{name: 'getText'}, {name: 'legacySizeFormat'}]},
      skipFromStart: 1,
    }),
  );
  assert.throws(
    () =>
      assertPortableRules({
        nextPageUrl: {selector: '.pages', pipeline: [{name: 'nextPageAfterCurrent'}]},
      }),
    /Unsupported ExKit v3 operation: nextPageAfterCurrent/,
  );
});
