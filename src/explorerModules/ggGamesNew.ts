// ==UserScript==
// @name __MSG_name__
// @downloadURL https://raw.githubusercontent.com/Feverqwe/tSearch/master/src/explorerModules/ggGamesNew.js
// @connect *://*.gameguru.ru/*
// @version 1.4
// @cacheTTL 86400
// @locale ru {"name": "Игры: Новые"}
// @locale en {"name": "Games: New"}
// @defaultLocale en
// ==/UserScript==

API_event('getItems', async () => {
  const today = new Date();
  const releases: {date: number; item: PackagedExplorerItem}[] = [];

  for (const offset of [0, 1]) {
    const month = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const response = await API_request(
      `https://gameguru.ru/calendar/${month.getMonth() + 1}/${month.getFullYear()}/pc/`,
    );
    const doc = API_getDoc(response.body, response.url);
    if (!doc.querySelector('a[data-month].active')) {
      throw new Error('GameGuru calendar not found');
    }
    for (const card of doc.querySelectorAll('.calendar-news')) {
      const link = card.querySelector<HTMLAnchorElement>('.calendar-news-title a[href^="/game/"]');
      const title = link?.textContent?.trim();
      const day = Number(card.querySelector('.calendar-date')?.textContent?.trim());
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      if (!link || !title || date.getMonth() !== month.getMonth() || date > today) continue;

      const poster = card.querySelector<HTMLImageElement>('.calendar-news-image img[src]')?.src;
      releases.push({date: +date, item: {title, url: link.href, ...(poster && {poster})}});
    }
  }
  const seen = new Set<string>();
  const items = releases
    .sort((a, b) => b.date - a.date)
    .flatMap(({item}) => {
      if (seen.has(item.url)) return [];
      seen.add(item.url);
      return [item];
    });
  return {success: true, items};
});
