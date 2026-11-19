import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {test} from 'node:test';

import type {TrackerResult} from '../../tools/trackerWorker';
import type RootStore from '../RootStore';

Object.defineProperty(globalThis, 'chrome', {value: {i18n: {getUILanguage: () => 'en'}}});

// Load the extension's TypeScript stores in Node using the same extensionless imports as the app.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const tsSource = new URL(specifier + '.ts', context.parentURL);
      if (existsSync(tsSource)) return nextResolve(tsSource.href, context);
    }
    return nextResolve(specifier, context);
  },
});
const [
  {default: SearchStore},
  {defaultOptions},
  {defaults},
  {default: QuickSearchStore},
  {collectQuickResults, savedQuickResults},
  {default: FiltersStore},
] = await Promise.all([
  import('../SearchStore.ts'),
  import('../../data/options.ts'),
  import('../../tools/qualityConfig.ts'),
  import('../QuickSearchStore.ts'),
  import('../../data/quickSearch.ts'),
  import('../FiltersStore.ts'),
]);
hooks.deregister();

function response(title?: string, next?: string): TrackerResult {
  return {
    success: true,
    results: title ? [{title, url: `https://fixture.test/${title}`, date: 0, size: 2 ** 30}] : [],
    nextPageRequest: next ? {url: next} : null,
  };
}

function source() {
  const first = Promise.withResolvers<TrackerResult>();
  const pages = [Promise.withResolvers<TrackerResult>(), Promise.withResolvers<TrackerResult>()];
  const nextRequests: string[] = [];
  const tracker = {
    worker: {
      search: () => first.promise,
      searchNext: ({url}: {url: string}) => {
        const page = pages[nextRequests.length];
        nextRequests.push(url);
        return page.promise;
      },
    },
    attach() {},
    deattach() {},
    setProfileOptions() {},
  };
  return {tracker, first, pages, nextRequests};
}

function fixture(qualitySettings = defaults, query = 'Sintel') {
  const fast = source();
  const slow = source();
  const trackers = new Map([
    ['fast', fast.tracker],
    ['slow', slow.tracker],
  ]);
  const root = {
    profiles: {prepSelectedTrackerIds: ['fast', 'slow', 'missing']},
    trackers: {getTrackerById: (id: string) => trackers.get(id)},
    optionValues: defaultOptions,
    qualitySettings,
    filters: {getFilter: () => () => true},
  } as unknown as RootStore;
  const search = new SearchStore(1, query, root);
  return {fast, slow, search, root, trackers};
}

test('word filters match overlapping terms and escaped phrases with optional category matching', async () => {
  const {fast, slow, search} = fixture();
  const pending = search.search();
  fast.first.resolve({
    ...response(),
    results: [
      {title: 'Linux Mint', url: '/mint', categoryTitle: 'Distributions'},
      {title: 'Linux Mint Beta', url: '/beta', categoryTitle: 'Distributions'},
      {title: 'Linux Debian', url: '/debian', categoryTitle: 'Distributions'},
      {title: 'Linux', url: '/linux', categoryTitle: 'Mint'},
    ],
  });
  slow.first.resolve(response());
  await pending;

  let categoryEnabled = false;
  const filters = new FiltersStore(() => categoryEnabled);
  const titles = () => search.pages[0].results.filter(filters.getFilter()).map(({title}) => title);
  filters.setText('LINUX linux\\ Mint -beta');
  assert.deepEqual(titles(), ['Linux Mint']);
  filters.setText('mint linux !beta');
  assert.deepEqual(titles(), ['Linux Mint']);
  categoryEnabled = true;
  assert.deepEqual(titles(), ['Linux Mint', 'Linux']);
});

test('a bounded filter excludes unavailable metadata and keeps known zero counts', async () => {
  const {fast, slow, search} = fixture();
  const pending = search.search();
  fast.first.resolve({
    ...response(),
    results: [
      {title: 'Known', url: '/known', seeds: 0, date: 1_700_000_000},
      {title: 'Unknown', url: '/unknown', date: -1},
      {title: 'Invalid', url: '/invalid', seeds: NaN},
      {title: 'Above maximum', url: '/above', seeds: 10, date: 1_710_000_000},
    ],
  });
  slow.first.resolve(response());
  await pending;

  const filters = new FiltersStore(() => false);
  const titles = () => search.pages[0].results.filter(filters.getFilter()).map(({title}) => title);
  assert.equal(titles().length, 4);
  filters.setSeed(0, 5);
  assert.deepEqual(titles(), ['Known']);
  filters.setSeed(0, 0);
  filters.setTime(0, 1_700_000_000);
  assert.deepEqual(titles(), ['Known']);
});

test('one malformed tracker row does not discard neighbouring results or pagination', async () => {
  const {fast, slow, search} = fixture();
  const pending = search.search();
  fast.first.resolve({
    ...response(undefined, '/more'),
    results: [
      ...response('First').results,
      {title: 123, url: '/malformed'} as unknown as TrackerResult['results'][number],
      ...response('Last').results,
    ],
  });
  slow.first.resolve(response());
  await pending;

  assert.deepEqual(
    search.pages[0].results.map(({title}) => title),
    ['First', 'Last'],
  );
  assert.equal(search.hasNextQuery, true);
});

test('quick search excludes trailers and teasers while retaining releases without a size', async () => {
  const {fast, slow, search} = fixture();
  const pending = search.search();
  fast.first.resolve({
    ...response(),
    results: [
      'Sintel Trailer (2010) 2160p',
      'Sintel Трейлер 1080p',
      'Sintel Teaser',
      'Sintel Тизер',
      'Sintel (2010) 720p',
    ].flatMap((title) => response(title).results.map((row) => ({...row, size: undefined}))),
  });
  slow.first.resolve(response());
  await pending;

  assert.equal(search.pages[0].results.length, 5);
  const quick = collectQuickResults(search);
  assert.deepEqual(
    quick.map(({title}) => title),
    ['Sintel (2010) 720p'],
  );
  assert.equal(quick[0].size, undefined);
});

test('quick search and saved previews show confident title and year matches only', async () => {
  const query = 'Big Buck Bunny 2008';
  const {fast, slow, search} = fixture(defaults, query);
  const titles = [
    'Big Buck Bunny (2008) 720p',
    'Big Buck Bunny (2009) 2160p',
    'Big Buck Bunny 1080p',
    'Big Bunny (2008) 2160p',
    'Bunny Buck Big (2008) 1080p',
    'Big Buck Bunny Trailer (2008) 2160p',
    'big buck bunny (2008) 1080p',
    'Big Buck Bunny (2008) CAMRip',
  ];
  const pending = search.search();
  fast.first.resolve({
    ...response(),
    results: titles.flatMap((title) => response(title).results),
  });
  slow.first.resolve(response());
  await pending;
  const quick = collectQuickResults(search);
  const matched = [titles[0], titles[6], titles[7]].sort();
  assert.deepEqual(quick.map(({title}) => title).sort(), matched);

  const cached = titles.map((title) => ({
    title,
    url: 'https://fixture.test/',
    trackerId: 'fast',
    label: '',
    quality: 500,
    sizeText: 'n/a',
  }));
  const restored = savedQuickResults(query).select?.({
    [query]: {query, time: 0, results: cached},
  });
  assert.deepEqual(restored?.map(({title}) => title).sort(), matched);
});

for (const [query, titles] of [
  ['1984 1984', ['1984 (1984) Blu-ray', '1984 (1956) Blu-ray', '1984 Blu-ray']],
  [
    '1917 2019',
    ['1917 / 1917 (2019) UHD BDRemux', '1917 / 1917 (1956) Blu-ray', '1917 / 1917 Blu-ray'],
  ],
] as const) {
  test(`numeric title ${query} remains available in quick search and saved previews`, async () => {
    const {fast, slow, search} = fixture(defaults, query);
    const pending = search.search();
    fast.first.resolve({
      ...response(),
      results: titles.flatMap((title) => response(title).results),
    });
    slow.first.resolve(response());
    await pending;
    assert.deepEqual(
      collectQuickResults(search).map(({title}) => title),
      [titles[0]],
    );

    const cached = titles.map((title) => ({
      title,
      url: 'https://fixture.test/',
      trackerId: 'fast',
      label: '',
      quality: 500,
      sizeText: 'n/a',
    }));
    const restored = savedQuickResults(query).select?.({
      [query]: {query, time: 0, results: cached},
    });
    assert.deepEqual(
      restored?.map(({title}) => title),
      [titles[0]],
    );
  });
}

test('title relevance survives release bonuses and an open search is regraded consistently', async () => {
  const {fast, slow, search} = fixture(
    {
      ...defaults,
      rules: [
        {
          patterns: [{text: '2160p'}],
          weights: [{criterion: 'video', points: 999}],
        },
      ],
    },
    'Sintel 2010',
  );
  const pending = search.search();
  fast.first.resolve({
    ...response(),
    results: ['Sintel (2009) 2160p', 'sintel (2010) 720p', 'SINTEL (2010) 720p'].flatMap(
      (title) => response(title).results,
    ),
  });
  slow.first.resolve(response());
  await pending;

  const page = search.pages[0];
  const ordered = () => page.sortedAndFilteredResults.map(({title}) => title);
  assert.deepEqual(ordered(), ['sintel (2010) 720p', 'SINTEL (2010) 720p', 'Sintel (2009) 2160p']);
  const [, lower, upper] = page.results;
  assert.equal(lower.quality, upper.quality);
  search.regrade();
  assert.deepEqual(ordered(), ['sintel (2010) 720p', 'SINTEL (2010) 720p', 'Sintel (2009) 2160p']);
});

test('custom release weights score book formats equally while keeping query relevance', async () => {
  const {fast, slow, search, root} = fixture({
    ...defaults,
    categoryMargin: 10,
    rules: [
      {
        patterns: [{text: 'EPUB'}, {text: 'PDF'}],
        weights: [
          {criterion: 'category', categoryId: 5, points: 20},
          {criterion: 'audio', categoryId: 5, points: 30},
        ],
      },
    ],
  });
  const pending = search.search();
  fast.first.resolve({
    ...response(),
    results: ['Sintel EPUB', 'Sintel PDF', 'Other EPUB'].flatMap(
      (title) => response(title).results,
    ),
  });
  slow.first.resolve(response());
  await pending;

  const page = search.pages[0];
  const [epub, pdf, unrelated] = page.results;
  assert.equal(epub.quality, pdf.quality);
  assert.ok(epub.quality > unrelated.quality);
  assert.equal(epub.categoryId, 5);

  search.setCategoryId(5);
  root.optionValues = {...root.optionValues, defineCategory: false};
  search.regrade();
  assert.equal(page.categoryId, undefined);
  assert.equal(page.results[0].categoryId, -1);
  assert.equal(page.results[0].quality, epub.quality);
});

for (const outcome of ['empty', 'release', 'error'] as const) {
  test(`the first ${outcome} response ends the initial wait while another source runs`, async () => {
    const {fast, slow, search} = fixture();
    const pending = search.search();
    assert.equal(search.waitingForFirstResponse, true);
    if (outcome === 'error') fast.first.reject(new Error('first source failed'));
    else fast.first.resolve(response(outcome === 'release' ? 'Sintel' : undefined));

    await Promise.resolve();
    assert.equal(search.waitingForFirstResponse, false);
    assert.equal(search.state, 'pending');
    assert.equal(search.trackerSearch.get('slow')?.state, 'pending');
    assert.equal(search.hasSuccessfulResponse, outcome !== 'error');
    assert.equal(search.getResultCountByTrackerId('fast'), outcome === 'release' ? 1 : 0);

    slow.first.resolve(response());
    await pending;
    assert.equal(search.state, 'done');
    assert.equal(search.hasSuccessfulResponse, true);
  });
}

test('a disposed search ignores late results and authentication errors', async () => {
  const {fast, slow, search} = fixture();
  const pending = search.search();
  search.dispose();
  fast.first.resolve(response('Late release', '/more'));
  slow.first.reject(Object.assign(new Error('Login required'), {code: 'AUTH_REQUIRED'}));
  await pending;

  assert.equal(search.getResultCountByTrackerId('fast'), 0);
  assert.equal(search.hasNextQuery, false);
  assert.equal(search.trackerSearch.get('slow')?.authRequired, undefined);
});

test('a failed next page can be retried without losing the earlier rows or duplicating them', async () => {
  const {fast, slow, search} = fixture();
  const pending = search.search();
  fast.first.resolve(response('First release', '/next'));
  slow.first.resolve(response());
  await pending;

  const next = search.searchNext();
  assert.equal(search.loadingMore, true);
  assert.equal(search.waitingForFirstResponse, false);
  fast.pages[0].reject(new Error('Page failed'));
  await next;

  assert.equal(search.trackerSearch.get('fast')?.state, 'error');
  assert.equal(search.hasNextQuery, true);
  assert.equal(search.getResultCountByTrackerId('fast'), 1);

  const retry = search.searchNext();
  fast.pages[1].resolve({
    ...response('First release', '/next'),
    results: [...response('First release').results, ...response('Next release').results],
  });
  await retry;
  assert.deepEqual(fast.nextRequests, ['/next', '/next']);
  assert.equal(search.hasNextQuery, false);
  assert.equal(search.getResultCountByTrackerId('fast'), 2);
});

test('removing the only tracker with another page makes pagination unavailable', async () => {
  const {fast, slow, search, trackers} = fixture();
  const initial = search.search();
  fast.first.resolve(response('First release', '/next'));
  slow.first.resolve(response());
  await initial;

  assert.equal(search.hasNextQuery, true);
  trackers.delete('fast');
  assert.equal(search.hasNextQuery, false);
  await search.searchNext();
  assert.deepEqual(fast.nextRequests, []);
});

test('a tracker can advance while another retries its failed page', async () => {
  const {fast, slow, search} = fixture();
  const initial = search.search();
  fast.first.resolve(response('Fast first', '/fast/2'));
  slow.first.resolve(response('Slow first', '/slow/2'));
  await initial;

  const second = search.searchNext();
  fast.pages[0].reject(new Error('Page failed'));
  slow.pages[0].resolve(response('Slow second', '/slow/3'));
  await second;

  const third = search.searchNext();
  assert.deepEqual(fast.nextRequests, ['/fast/2', '/fast/2']);
  assert.deepEqual(slow.nextRequests, ['/slow/2', '/slow/3']);
  fast.pages[1].resolve(response('Fast second'));
  slow.pages[1].resolve(response('Slow third'));
  await third;

  assert.deepEqual(
    search.pages.map(({results}) => results.map(({title}) => title)),
    [['Fast first', 'Slow first'], ['Slow second', 'Fast second'], ['Slow third']],
  );
  assert.equal(search.hasNextQuery, false);
});

test('an older card cannot publish results or tracker errors over a newer quick search', async () => {
  const fast = source();
  const slow = source();
  const sessions = new Map<number, InstanceType<typeof SearchStore>>();
  let tracker = slow.tracker;
  let id = 0;
  const root = {
    searchReady: true,
    profiles: {profile: {id: 'films', trackers: []}, prepSelectedTrackerIds: ['tracker']},
    optionValues: defaultOptions,
    qualitySettings: defaults,
    trackers: {getTrackerById: () => tracker},
    createSearch(query: string) {
      const search = new SearchStore(++id, query, root);
      sessions.set(id, search);
      return search;
    },
    destroySearch(id: number) {
      sessions.get(id)?.dispose();
      sessions.delete(id);
    },
  } as unknown as RootStore;

  const quick = new QuickSearchStore(root);
  const first = quick.start('card-a', 'Big Buck Bunny');
  const firstRun = quick.current;
  assert.ok(firstRun);
  const old = firstRun.search;
  assert.equal(old.state, 'pending');

  tracker = fast.tracker;
  const second = quick.start('card-b', 'Sintel');
  fast.first.resolve(response('Sintel 1080p'));
  await second;

  slow.first.reject(Object.assign(new Error('Login needed'), {code: 'AUTH_REQUIRED'}));
  await first;
  assert.equal(quick.current?.cardId, 'card-b');
  assert.equal(quick.current?.search.trackerSearch.get('tracker')?.state, 'done');
  assert.equal(old?.trackerSearch.get('tracker')?.authRequired, undefined);
  assert.equal(quick.state, 'ready');
  assert.deepEqual(
    quick.results?.map(({title}) => title),
    ['Sintel 1080p'],
  );
  quick.clear();
});
