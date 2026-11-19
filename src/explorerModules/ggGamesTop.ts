// ==UserScript==
// @name __MSG_name__
// @downloadURL https://raw.githubusercontent.com/Feverqwe/tSearch/master/src/explorerModules/ggGamesTop.js
// @connect *://*.gameguru.ru/*
// @version 1.3
// @cacheTTL 86400
// @locale ru {"name": "Игры: Популярные на ПК"}
// @locale en {"name": "Games: Popular on PC"}
// @locale uk {"name": "Ігри: Популярні на ПК"}
// @defaultLocale en
// ==/UserScript==

API_event('getItems', async () => {
  const items = new Map<string, PackagedExplorerItem>();
  const url = new URL('https://gameguru.ru/games/platform_pc/');
  for (let page = 1; page <= 5; page++) {
    const response = await API_request(url.href);
    const doc = API_getDoc(response.body, response.url);
    const list = doc.querySelector('#publications-wrap');
    if (!list) throw new Error('GameGuru catalog not found');
    for (const card of list.querySelectorAll('.short-news')) {
      const link = card.querySelector<HTMLAnchorElement>('.short-news-title a[href^="/game/"]');
      const title = link?.textContent?.trim();
      if (!link || !title || items.has(link.href)) continue;
      const poster = card.querySelector<HTMLImageElement>('.short-news-image img[src]')?.src;
      items.set(link.href, {title, url: link.href, ...(poster && {poster})});
    }
    url.searchParams.set('page', String(page + 1));
    if (!doc.querySelector(`a.show-more[href="${url.pathname}${url.search}"]`)) break;
  }
  return {success: true, items: [...items.values()]};
});
