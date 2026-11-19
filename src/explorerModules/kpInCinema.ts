// ==UserScript==
// @name __MSG_name__
// @downloadURL https://raw.githubusercontent.com/Feverqwe/tSearch/master/src/explorerModules/kpInCinema.js
// @connect *://*.kinopoisk.ru/*
// @version 1.5
// @cacheTTL 86400
// @locale ru {"name": "Кинопоиск: в кино"}
// @locale en {"name": "Kinopoisk: in cinema"}
// @defaultLocale en
// ==/UserScript==

const readItems = (doc: Document) => {
  const items: PackagedExplorerItem[] = [];
  const cards = doc.querySelectorAll('[data-test-id="movie-list-item"]');
  for (const card of cards) {
    const link = card.querySelector<HTMLAnchorElement>(
      'a[data-test-id="next-link"][href^="/film/"]',
    );
    const title = link?.querySelector('span[class*="styles_mainTitle__"]')?.textContent?.trim();
    if (!link || !title || !/^\/film\/\d+\/$/.test(link.pathname)) continue;

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
  const url = new URL('https://www.kinopoisk.ru/lists/movies/movies-in-cinema/');
  const items = new Map<string, PackagedExplorerItem>();
  for (let page = 1; page <= 3; page++) {
    const response = await API_request(url.href);
    const doc = API_getDoc(response.body, response.url);
    for (const item of readItems(doc)) {
      if (!items.has(item.url)) items.set(item.url, item);
    }

    url.searchParams.set('page', String(page + 1));
    if (!doc.querySelector(`a[href="${url.pathname}${url.search}"]`)) break;
  }
  return {success: true, items: [...items.values()]};
});
