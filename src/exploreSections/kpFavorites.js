// ==UserScript==
// @name __MSG_name__
// @siteURL https://www.kinopoisk.ru
// @connect *://*.kinopoisk.ru/*
// @version 1.0
// @action {"icon":"update","title":"__MSG_update__","command":"update"}
// @locale ru {"name": "Кинопоиск: Избранное", "update": "Обновить"}
// @locale en {"name": "Kinopoisk: Favorites", "update": "Update"}
// @defaultLocale en
// ==/UserScript==

const kpGetImgFileName = url => {
  return url.replace(/sm_film/, 'film');
};

const spaceReplace = text => {
  return text.replace(/[\s\xA0]/g, ' ');
};

const parseInfo = text => {
  const m = /^(?:(.*)\s+|)\((\d{4})[^)]*\)(?:\s+\d+\s+.{3}\.)?$/.exec(text);
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
  const linkNode = item.querySelector('div.info > a.name');
  const url = prop(linkNode, 'href');
  let title = normText(linkNode);

  let year = null;
  let titleOriginal = null;
  const info = parseInfo(normText(item.querySelector('div.info > span')));
  if (info) {
    titleOriginal = info.title;
    year = info.year;
  }

  const imgNode = item.querySelector('.poster img[src]');
  const href = prop(imgNode, 'src');
  if (/spacer\.gif$/.test(href)) {
    imgNode.src = imgNode.title;
  }
  const poster = kpGetImgFileName(prop(imgNode, 'src') || '');

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

  if (/www\.kinopoisk\.ru\/$/.test(response.url)) {
    const err = new Error('AUTH');
    err.code = 'AUTH_REQUIRED';
    err.url = 'https://www.kinopoisk.ru/#login';
    throw err;
  }

  const ddBl = {};
  const results = [];
  Array.from(doc.querySelectorAll('#itemList > li.item')).forEach(item => {
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
  const urls = [];
  const items = [];
  const category = 1;
  const getPage = page => {
    if (page > 20) {
      console.warn('Favorite pages limit reached');
      return;
    }
    return API_request({
      method: 'GET',
      url: `https://www.kinopoisk.ru/mykp/movies/list/type/${category}/page/${page}/sort/default/vector/desc/vt/all/format/full/perpage/25/`
    }).then(response => {
      return onPageLoad(response);
    }).then(_items => {
      const newItems = _items.filter(item => {
        if (urls.indexOf(item.url) === -1) {
          urls.push(item.url);
          return true;
        }
      });
      items.push(...newItems);
      if (newItems.length) {
        return getPage(page + 1);
      }
    });
  };
  return getPage(1).then(() => items);
};

API_event('getItems', () => {
  return {};
});

API_event('command', command => {
  switch (command) {
    case 'update': {
      return getItems().then(items => ({items}));
    }
  }
});