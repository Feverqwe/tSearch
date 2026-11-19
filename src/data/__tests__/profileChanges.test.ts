import assert from 'node:assert/strict';
import {test} from 'node:test';

import {profileRoute} from '../../ui/profileRoutes.ts';
import {ProfileConflict, mergeProfileDraft, mergeProfileOrder} from '../profileChanges.ts';

const films = {id: 'films', name: 'Films', trackers: []};
const other = {id: 'other', name: 'Other', trackers: []};

test('legacy link keeps the exact profile ID and query when its route is migrated', () => {
  const route = profileRoute('films / archive', '?query=A%2BB&theme=dark');
  assert.equal(decodeURIComponent(route.split('?')[0].split('/').at(-1)!), 'films / archive');
  assert.equal(new URL(route, 'https://example.invalid').searchParams.get('query'), 'A+B');
  assert.equal(new URL(route, 'https://example.invalid').searchParams.get('theme'), 'dark');
});

test('saving one profile preserves edits from another tab and refuses a conflict', () => {
  const latestOther = {...other, name: 'Changed in another tab'};
  const draft = {...films, name: 'Local change'};
  assert.deepEqual(mergeProfileDraft([films, latestOther], films, draft), [draft, latestOther]);
  assert.throws(
    () => mergeProfileDraft([{...films, name: 'Other edit'}, other], films, draft),
    ProfileConflict,
  );
});

test('reordering keeps new profiles and refuses to delete externally edited data', () => {
  const newProfile = {...other, id: 'later'};
  assert.deepEqual(
    mergeProfileOrder([films, other, newProfile], [films, other], ['other', 'films']),
    [other, films, newProfile],
  );
  assert.throws(
    () => mergeProfileOrder([films, {...other, name: 'Edited'}], [films, other], ['films']),
    ProfileConflict,
  );
});
