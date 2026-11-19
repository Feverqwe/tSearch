// ==UserScript==
// @name __MSG_name__
// @downloadURL https://raw.githubusercontent.com/Feverqwe/tSearch/master/src/explorerModules/kpPopular.js
// @connect *://*.kinopoisk.ru/*
// @version 1.3
// @cacheTTL 86400
// @locale ru {"name": "Фильмы"}
// @locale en {"name": "Movies"}
// @defaultLocale en
// ==/UserScript==

const spaceReplace = (text: string) => {
  return text.replace(/[\s\xA0]/g, ' ');
};

const parseTitleTypeYears = (text: string) => {
  const m = /^(.*)\s+\((?:[^,]+,\s)?(\d{4})(?:\s[^)]+)?\)$/.exec(text);
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

const prop = (node: Element | null, key: 'href' | 'src'): string => {
  return (node as (HTMLAnchorElement & HTMLImageElement) | null)?.[key] ?? '';
};

const parseItem = (item: Element): PackagedExplorerItem => {
  const linkNode = item.querySelectorAll('a')[1];
  const url = prop(linkNode, 'href');

  let title = null;
  let year = null;
  const info = parseTitleTypeYears(normText(linkNode));
  if (info) {
    title = info.title;
    year = info.year;
  }

  const id = /[-\/](\d+)\/$/.exec(url)?.[1];
  const poster = id
    ? API_getExplorerPoster(new URL(`/images/film/${id}.jpg`, item.baseURI).href)
    : '';

  let titleOriginal = normText(item.querySelector('i'));

  if (year) {
    if (title) {
      title += ' ' + year;
    }
    if (titleOriginal) {
      titleOriginal += ' ' + year;
    }
  }

  const result: PackagedExplorerItem = {
    title: title ?? '',
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

const onPageLoad = (response: Awaited<ReturnType<typeof API_request>>) => {
  const content = response.body;
  const doc = API_getDoc(content, response.url);

  const ddBl: Record<string, boolean> = Object.create(null);
  const results: PackagedExplorerItem[] = [];
  Array.from(doc.querySelectorAll('div.stat > div.el')).forEach((item) => {
    try {
      const result = parseItem(item);

      if (ddBl[result.url]) {
        throw new Error('Url already exists');
      }
      ddBl[result.url] = true;

      validateItem(result);

      results.push(result);
    } catch (err) {
      console.error('Parse item error', err);
    }
  });
  return results;
};

const getItems = () => {
  return API_request({
    method: 'GET',
    url: 'https://www.kinopoisk.ru/popular/day/now/perpage/200/',
  }).then((response) => {
    return onPageLoad(response);
  });
};

API_event('getItems', () => {
  return getItems().then((items) => {
    return {
      success: true,
      items,
    };
  });
});
