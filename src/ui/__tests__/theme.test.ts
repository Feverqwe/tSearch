import assert from 'node:assert/strict';
import {test} from 'node:test';

import {resolveTheme, themedSearch} from '../theme.ts';

test('a linked theme overrides the preference only for that route', () => {
  assert.equal(resolveTheme('?theme=dark', 'light'), 'dark');
  assert.equal(resolveTheme('?theme=system', 'dark'), 'system');
  assert.equal(resolveTheme('?theme=typo', 'light'), 'light');
  assert.equal(resolveTheme('', 'unknown'), 'system');
});

test('navigation carries the theme without changing destination parameters', () => {
  const search = new URLSearchParams(themedSearch('?query=A%2BB&from=history', 'dark'));
  assert.equal(search.get('query'), 'A+B');
  assert.equal(search.get('from'), 'history');
  assert.equal(search.get('theme'), 'dark');
  assert.equal(themedSearch('?theme=light', 'dark'), '?theme=light');
});
