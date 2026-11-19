// ==UserScript==
// @name __MSG_name__
// @downloadURL https://raw.githubusercontent.com/Feverqwe/tSearch/master/src/explorerModules/imdbSeries.js
// @connect https://www.imdb.com/*
// @version 1.4
// @cacheTTL 86400
// @locale ru {"name": "IMDb: Сериалы"}
// @locale en {"name": "IMDb: TV Series"}
// @locale uk {"name": "IMDb: Серіали"}
// @defaultLocale en
// ==/UserScript==

API_event('getItems', async () => {
  const response = await API_request('https://www.imdb.com/chart/tvmeter/');
  const doc = API_getDoc(response.body, response.url);
  const items = new Map<string, PackagedExplorerItem>();

  for (const card of doc.querySelectorAll('li.ipc-metadata-list-summary-item')) {
    const link = card.querySelector<HTMLAnchorElement>(
      'a.ipc-title-link-wrapper[href^="/title/tt"]',
    );
    const title = link
      ?.querySelector('.ipc-title__text')
      ?.textContent?.trim()
      .replace(/^\d+\.\s+/, '');
    if (!link || !title || !/^\/title\/tt\d+\/$/.test(link.pathname)) continue;

    const url = new URL(link.pathname, response.url).href;
    if (items.has(url)) continue;
    const image = card.querySelector<HTMLImageElement>('.ipc-poster img[src]');
    const poster = API_getExplorerPoster(image?.src ?? '');
    const details = card.querySelector('.cli-title-metadata li')?.textContent ?? '';
    const year = /\b\d{4}\b/.exec(details)?.[0] ?? /\((\d{4})\)$/.exec(image?.alt ?? '')?.[1];
    items.set(url, {
      title: year ? `${title} ${year}` : title,
      url,
      ...(poster && {poster}),
    });
  }
  if (!items.size) throw new Error('No IMDb titles found');
  return {success: true, items: [...items.values()]};
});
