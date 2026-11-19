import assert from 'node:assert/strict';
import {test} from 'node:test';

import {clampPage, moveByKey, replaceFavorite} from '../explorerView.ts';

test('removal of the last item on a page displays the preceding page', () => {
  assert.equal(clampPage(2, 9, 4), 2);
  assert.equal(clampPage(2, 8, 4), 1);
  assert.equal(clampPage(1, 0, 4), 0);
});

test('moving a favorite past a page edge updates the whole saved order', () => {
  assert.deepEqual(
    moveByKey(['a', 'b', 'c', 'd'], 'c', -1, (key) => key),
    ['a', 'c', 'b', 'd'],
  );
});

test('an edited favorite cannot overwrite another favorite', () => {
  const items = [{url: 'https://films.test/a'}, {url: 'https://films.test/b'}];
  assert.throws(() => replaceFavorite(items, items[0].url, items[1]), /FAVORITE_URL_CONFLICT/);
  assert.deepEqual(
    replaceFavorite(items, items[0].url, {url: 'https://films.test/c'}).map(({url}) => url),
    ['https://films.test/c', 'https://films.test/b'],
  );
});
