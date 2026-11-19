import assert from 'node:assert/strict';
import {test} from 'node:test';
import {catalogFromListings} from '../repositoryListing.ts';

test('partial failure retains successful items and is distinct from an empty source', () => {
  const file = {
    name: 'films.json',
    download_url: 'https://files.test/films.json',
    html_url: 'https://files.test/films',
  };
  const shared = {status: 'fulfilled', value: [file]} as const;
  const results = catalogFromListings(
    ['first', 'broken', 'third'],
    [shared, {status: 'rejected', reason: 'offline'}, shared],
  );
  assert.deepEqual(results, {files: [file], failures: ['broken'], succeeded: 2});
  assert.deepEqual(catalogFromListings(['empty'], [{status: 'fulfilled', value: []}]), {
    files: [],
    failures: [],
    succeeded: 1,
  });
});
