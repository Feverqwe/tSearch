// ==UserScript==
// @name __MSG_name__
// @connect *://*.kinopoisk.ru/*
// @version 1.0
// @locale ru {"name": "Фильмы"}
// @locale en {"name": "Movies"}
// @defaultLocale en
// ==/UserScript==

const spaceReplace = text => {
  return text.replace(/[\s\xA0]/g, ' ');
};

const parseTitleTypeYears = text => {
  const m = /^(.*)\s+\((?:[^,]+,\s)?(\d{4})(?:\s[^)]+)?\)$/.exec(text);
  if (m) {
    return {
      title: m[1],
      year: parseInt(m[2], 10)
    };
  }
};

const validateItem = item => {
  Object.keys(item).forEach(key => {
    if (!item[key]) {
      throw new Error(`Item ${key} is empty!`);
    }
  });
};

const text = node => {
  return node && node.textContent || '';
};

const normText = node => {
  return spaceReplace(text(node)).trim();
};

const prop = (node, prop) => {
  return node && node[prop];
};

const parseItem = item => {
  const linkNode = item.querySelectorAll('a')[1];
  const url = prop(linkNode, 'href');

  let title = null;
  let year = null;
  const info = parseTitleTypeYears(normText(linkNode));
  if (info) {
    title = info.title;
    year = info.year;
  }

  let poster = null;
  const m = /-(\d+)\/$/.exec(url);
  if (m) {
    const tmpNode = linkNode.cloneNode();
    tmpNode.href = `/images/film/${m[1]}.jpg`;
    item.appendChild(tmpNode);
    poster = tmpNode.href;
  }

  let titleOriginal = normText(item.querySelector('i'));

  if (year) {
    if (title) {
      title += ' ' + year;
    }
    if (titleOriginal) {
      titleOriginal += ' ' + year;
    }
  }

  const result = {
    title: title,
    url: url
  };

  if (titleOriginal) {
    result.titleOriginal = titleOriginal;
  }

  if (poster) {
    result.poster = poster;
  }

  return result;
};

const onPageLoad = response => {
  const content = response.body;
  const doc = API_getDoc(content, response.url);

  const ddBl = {};
  const results = [];
  Array.from(doc.querySelectorAll('div.stat > div.el')).forEach(item => {
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
    url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/'
  }).then(response => {
    return onPageLoad(response);
  });
};

API_event('getItems', () => {
  return getItems().then(items => ({items}));
});