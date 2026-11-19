// ==UserScript==
// @name __MSG_name__
// @downloadURL https://raw.githubusercontent.com/Feverqwe/tSearch/master/src/explorerModules/kpFavorites.js
// @siteURL https://www.kinopoisk.ru
// @connect *://*.kinopoisk.ru/*
// @version 1.5
// @action {"icon":"update","title":"__MSG_update__","command":"update"}
// @locale ru {"name": "Кинопоиск: Избранное", "update": "Обновить"}
// @locale en {"name": "Kinopoisk: Favorites", "update": "Update"}
// @defaultLocale en
// ==/UserScript==

const spaceReplace = (text: string) => {
  return text.replace(/[\s\xA0]/g, ' ');
};

const parseInfo = (text: string) => {
  const m = /^(?:(.*)\s+|)\((\d{4})[^)]*\)(?:\s+\d+\s+.{3}\.)?$/.exec(text);
  if (m) {
    return {
      title: m[1],
      year: parseInt(m[2], 10),
    };
  }
};

const validateItem = (item: PackagedExplorerItem) => {
  Object.keys(item).forEach((key) => {
    if (!item[key as keyof PackagedExplorerItem]) {
      throw new Error(`Item ${key} is empty!`);
    }
  });
};

const text = (node: Node | null) => {
  return (node && node.textContent) || '';
};

const normText = (node: Node | null) => {
  return spaceReplace(text(node)).trim();
};

const readPoster = (item: Element, titleUrl: string) => {
  const address = URL.parse(titleUrl);
  if (address?.origin === 'https://www.kinopoisk.ru') {
    const id = /^\/(?:film|series)\/(\d+)\/?$/.exec(address.pathname)?.[1];
    if (id) {
      return API_getExplorerPoster(new URL(`/images/film/${id}.jpg`, address.origin).href);
    }
  }

  const image = item.querySelector<HTMLImageElement>('.poster img[src]');
  if (!image) return '';
  const src = /spacer\.gif$/.test(image.src) ? image.title.trim() : image.src;
  const source = src ? URL.parse(src, item.baseURI) : null;
  return source && (source.protocol === 'https:' || source.protocol === 'http:')
    ? API_getExplorerPoster(source.href)
    : '';
};

const parseItem = (item: Element): PackagedExplorerItem => {
  const linkNode = item.querySelector<HTMLAnchorElement>('div.info > a.name');
  const url = linkNode?.href ?? '';
  let title = normText(linkNode);

  let year = null;
  let titleOriginal = null;
  const info = parseInfo(normText(item.querySelector('div.info > span')));
  if (info) {
    titleOriginal = info.title;
    year = info.year;
  }

  const poster = readPoster(item, url);

  if (year) {
    if (title) {
      title += ' ' + year;
    }
    if (titleOriginal) {
      titleOriginal += ' ' + year;
    }
  }

  const result: PackagedExplorerItem = {
    title: title,
    url: url,
  };

  if (titleOriginal) {
    result.titleOriginal = titleOriginal;
  }

  if (poster) {
    result.poster = poster;
  }

  return result;
};

const authRequired = () =>
  Object.assign(new Error('Kinopoisk login required'), {
    code: 'AUTH_REQUIRED',
    url: 'https://www.kinopoisk.ru/#login',
  });

const readFolder = (response: Awaited<ReturnType<typeof API_request>>, folder: URL) => {
  const address = new URL(response.url);
  if (address.origin === folder.origin && address.pathname === '/') {
    throw authRequired();
  }

  if (address.origin !== folder.origin || address.pathname !== folder.pathname) {
    throw new Error('Kinopoisk returned a different folder');
  }
  const doc = API_getDoc(response.body, response.url);
  const list = doc.querySelector('#itemList');
  if (!list && !doc.querySelector('p.emptyMessage')) {
    throw new Error('Kinopoisk folder not found');
  }

  const results: PackagedExplorerItem[] = [];
  for (const item of list?.querySelectorAll(':scope > li.item') ?? []) {
    try {
      const result = parseItem(item);
      validateItem(result);
      results.push(result);
    } catch (err) {
      console.error('Parse item error', err);
    }
  }
  return results;
};

const getItems = async ({categoryId}: Record<string, string>) => {
  const id = typeof categoryId === 'string' ? categoryId.trim() : '';
  if (!/^\d+$/.test(id)) throw new Error('Invalid Kinopoisk folder ID');

  const folder = new URL(`https://www.kinopoisk.ru/mykp/folders/${id}/`);
  const items = new Map<string, PackagedExplorerItem>();
  for (let page = 1; page <= 20; page++) {
    if (page > 1) folder.searchParams.set('page', String(page));
    const count = items.size;
    const response = await API_request({url: folder.href, credentials: 'include'}).catch(
      (error: unknown) => {
        if (
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          error.statusCode === 401
        ) {
          throw authRequired();
        }
        throw error;
      },
    );
    for (const item of readFolder(response, folder)) {
      if (!items.has(item.url)) items.set(item.url, item);
    }
    if (items.size === count) break;
  }
  return [...items.values()];
};

API_event('getItems', () => {
  return {
    success: true,
  };
});

API_event('command', (command, params) => {
  switch (command) {
    case 'update': {
      return getItems(params).then((items) => {
        return {
          success: true,
          items,
        };
      });
    }
  }
});
