// ==UserScript==
// @name __MSG_name__
// @downloadURL https://raw.githubusercontent.com/Feverqwe/tSearch/master/src/explorerModules/kpSeries.js
// @connect *://*.kinopoisk.ru/*
// @version 1.7
// @cacheTTL 86400
// @locale ru {"name": "Сериалы"}
// @locale en {"name": "Series"}
// @defaultLocale en
// ==/UserScript==

const readItems = (doc: Document) => {
  const items: PackagedExplorerItem[] = [];
  const cards = doc.querySelectorAll('[data-test-id="movie-list-item"]');
  for (const card of cards) {
    const link = card.querySelector<HTMLAnchorElement>(
      'a[data-test-id="next-link"][href^="/series/"]',
    );
    const title = link?.querySelector('span[class*="styles_mainTitle__"]')?.textContent?.trim();
    if (!link || !title || !/^\/series\/\d+\/$/.test(link.pathname)) continue;

    const original = link.querySelector('[class*="_secondaryTitle__"]')?.textContent?.trim();
    const details = link.querySelector('[class*="_secondaryText__"]')?.textContent ?? '';
    const year = /^(?:,\s*)?(\d{4})\b/.exec(details.trim())?.[1];
    const image = card.querySelector<HTMLImageElement>('a[aria-hidden="true"] img[src]');
    const poster = API_getExplorerPoster(image?.src ?? '');
    items.push({
      url: link.href,
      title: year ? `${title} ${year}` : title,
      ...(original && {titleOriginal: year ? `${original} ${year}` : original}),
      ...(poster && {poster}),
    });
  }
  if (!items.length) throw new Error('No Kinopoisk titles found');
  return items;
};

API_event('getItems', async () => {
  const response = await API_request(
    'https://www.kinopoisk.ru/lists/movies/?sort=votes&b=series&b=top',
  );
  const doc = API_getDoc(response.body, response.url);
  const items = new Map(readItems(doc).map((item) => [item.url, item]));
  return {success: true, items: [...items.values()]};
});
