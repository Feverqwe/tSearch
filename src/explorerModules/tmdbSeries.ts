// ==UserScript==
// @name __MSG_name__
// @connect https://www.themoviedb.org/*
// @version 1.2
// @requestMode tab
// @cacheTTL 86400
// @locale ru {"name": "TMDB: Сериалы"}
// @locale en {"name": "TMDB: TV Series"}
// @locale uk {"name": "TMDB: Серіали"}
// @defaultLocale en
// ==/UserScript==

const withYear = (title: string, details: string) => {
  const year = /\b\d{4}\b/.exec(details)?.[0];
  return year ? `${title} ${year}` : title;
};

const getTmdbItems = async () => {
  const url = new URL('https://www.themoviedb.org/tv');
  const items = new Map<string, PackagedExplorerItem>();
  for (let page = 1; page <= 5; page++) {
    const response = await API_request(url.href);
    const doc = API_getDoc(response.body, response.url);
    const posters = new Map<string, string>();
    for (const image of doc.querySelectorAll<HTMLImageElement>('a[href^="/tv/"] img.poster[src]')) {
      const link = image.closest<HTMLAnchorElement>('a');
      if (link) posters.set(link.pathname, API_getExplorerPoster(image.src));
    }
    for (const link of doc.querySelectorAll<HTMLAnchorElement>(
      'a[data-media-type="tv"][href^="/tv/"]',
    )) {
      const title = link.querySelector('h2')?.textContent?.trim();
      if (!title || !/^\/tv\/\d+(?:[-/]|$)/.test(link.pathname) || items.has(link.href)) continue;
      const details = link.parentElement?.querySelector('.release_date')?.textContent ?? '';
      const poster = posters.get(link.pathname);
      items.set(link.href, {
        title: withYear(title, details),
        url: link.href,
        ...(poster && {poster}),
      });
    }
    url.searchParams.set('page', String(page + 1));
    if (!doc.querySelector(`a.load_more[href="${url.search}"]`)) break;
  }
  if (!items.size) throw new Error('No TMDB titles found');
  return [...items.values()];
};

API_event('getItems', async () => ({success: true, items: await getTmdbItems()}));
