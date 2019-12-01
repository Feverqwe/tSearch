// ==UserScript==
// @name __MSG_name__
// @downloadURL https://raw.githubusercontent.com/Feverqwe/tSearch/master/src/explorerModules/kpSeries.js
// @connect *://*.kinopoisk.ru/*
// @version 1.4
// @cacheTTL 86400
// @locale ru {"name": "Сериалы"}
// @locale en {"name": "Series"}
// @defaultLocale en
// ==/UserScript==

const spaceReplace = text => {
  return text.replace(/[\s\xA0]/g, ' ');
};

const parseInfo = text => {
  let title;
  let year;

  const m1 = /^(\d{4}(?:-\d{4})?)$/.exec(text);
  if (m1) {
    year = parseInt(m1[1], 10);
  } else {
    const m = /^(.+),\s+(?:(\d{4})-(?:\d{4})?)$/.exec(text);
    if (m) {
      title = m[1];
      year = parseInt(m[2], 10);
    }
  }

  if (title) {
    return {
      title: title,
      year: year
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
  const linkNode = item.querySelector('.selection-film-item-meta > a.selection-film-item-meta__link');
  const url = prop(linkNode, 'href');
  const title = normText(linkNode.querySelector('.selection-film-item-meta__name'));

  const originalNameNode = linkNode.querySelector('.selection-film-item-meta__original-name');
  const info = parseInfo(normText(originalNameNode));
  let originalTitle = null;
  if (info) {
    originalTitle = info.title;
  }

  const imgNode = item.querySelector('.selection-film-item-poster img[src]');
  const posterUrl = prop(imgNode, 'src') || '';

  const result = {
    title: title,
    url: url
  };

  if (originalTitle) {
    result.titleOriginal = originalTitle;
  }

  if (posterUrl) {
    result.poster = posterUrl;
  }

  return result;
};

const onPageLoad = response => {
  const content = response.body;
  const doc = API_getDoc(content, response.url);

  const ddBl = {};
  const results = [];
  Array.from(doc.querySelectorAll('.desktop-grid-column > .selection-list > .selections-film-item')).forEach(item => {
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
    url: 'https://www.kinopoisk.ru/lists/navigator/?quick_filters=serials',
  }).then(response => {
    return onPageLoad(response);
  });
};

API_event('getItems', () => {
  return getItems().then(items => {
    return {
      success: true,
      items
    };
  });
});