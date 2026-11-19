// ==UserScript==
// @name ThePirateBay
// @trackerURL https://thepiratebay.org
// @icon data:image/webp;base64,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
// @description Download music, movies, games, software and much more. The Pirate Bay is the world\'s largest bittorrent tracker.
// @connect https://apibay.org/*
// @version 1.0.5
// ==/UserScript==

import type {TrackerItem, TrackerResult} from '../tools/trackerWorker';

const categoryGroups: Record<number, string> = {
  1: 'Audio',
  2: 'Video',
  3: 'Applications',
  4: 'Games',
  5: 'Porn',
  6: 'Other',
};

API_event('search', async ({query}): Promise<TrackerResult> => {
  const search = new URL('https://apibay.org/q.php');
  search.searchParams.set('q', query);
  search.searchParams.set('cat', '0');

  const response = await API_request(search.href);
  const records: unknown = JSON.parse(response.body);
  if (!Array.isArray(records)) throw new Error('Unexpected The Pirate Bay search response');

  const results = records.flatMap((record) => {
    const item = parseResult(record);
    return item ? [item] : [];
  });

  return {success: true, results, nextPageRequest: null};
});

function parseResult(record: unknown): TrackerItem | null {
  if (!record || typeof record !== 'object') return null;
  const {id, name, info_hash, category, size, seeders, leechers, added} = record as Record<
    string,
    unknown
  >;
  const resultId = readInteger(id);
  const title = typeof name === 'string' ? name.trim() : '';
  // APIBay uses ID 0 for its empty-result record.
  if (!resultId || !title) return null;

  const categoryCode = readInteger(category);
  const hash =
    typeof info_hash === 'string' && /^[a-f0-9]{40}$/i.test(info_hash) ? info_hash : null;
  return {
    title,
    url: `https://thepiratebay.org/description.php?id=${resultId}`,
    downloadUrl: hash
      ? `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title.toWellFormed())}`
      : null,
    categoryTitle:
      categoryCode === undefined ? undefined : categoryGroups[Math.floor(categoryCode / 100)],
    categoryUrl: categoryCode ? `https://thepiratebay.org/search.php?q=&cat=${categoryCode}` : null,
    size: readInteger(size),
    seeds: readInteger(seeders),
    peers: readInteger(leechers),
    date: readInteger(added),
  };
}

function readInteger(value: unknown): number | undefined {
  const number = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  return typeof number === 'number' && Number.isSafeInteger(number) && number >= 0
    ? number
    : undefined;
}
