import assert from 'node:assert/strict';
import {test} from 'node:test';

import encodeCp1251 from '../encodeCp1251.ts';

test('legacy tracker queries keep Windows-1251 letters and URL delimiters within one field', () => {
  const encoded = encodeCp1251('Їжак & C++ #1');
  assert.deepEqual(Array.from(new URLSearchParams(`query=${encoded}&limit=10`).keys()), [
    'query',
    'limit',
  ]);
  const bytes = encoded.replace(/%([\dA-F]{2})/gi, (_, hex) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
  assert.equal(
    new TextDecoder('windows-1251').decode(Buffer.from(bytes, 'latin1')),
    'Їжак & C++ #1',
  );
  assert.equal(encodeCp1251('💿'), encodeURIComponent('💿'));
});
