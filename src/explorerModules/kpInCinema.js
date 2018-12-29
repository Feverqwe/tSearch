// ==UserScript==
// @name __MSG_name__
// @connect *://*.kinopoisk.ru/*
// @version 1.1
// @cacheTTL 86400
// @locale ru {"name": "Кнопоиск: в кино"}
// @locale en {"name": "Kinopoisk: in cinema"}
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
  const poster = kpGetImgFileName(prop(item.querySelector('.poster img[src]'), 'src') || '');

  const linkNode = item.querySelector('.info .name a');
  let title = normText(linkNode);
  const url = prop(linkNode, 'href');

  let year = null;
  let titleOriginal = null;
  const info = parseInfo(normText(item.querySelector('.info .name span')));
  if (info) {
    titleOriginal = info.title;
    year = info.year;
  }

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
  Array.from(doc.querySelectorAll('div.filmsListNew > div.item')).forEach(item => {
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
  const items = [];
  let promise = Promise.resolve();
  ['0', '1', '2'].forEach(page => {
    promise = promise.then(() => {
      return API_request({
        method: 'GET',
        url: `https://www.kinopoisk.ru/afisha/new/page/${page}/`,
        useCookie: false,
      }).then(response => {
        return onPageLoad(response);
      }).then(_items => {
        items.push(..._items);
      }, err => {
        console.error('Page load error', err);
      });
    });
  });
  return promise.then(() => items);
};

API_event('getItems', () => {
  return getItems().then(items => {
    return {
      success: true,
      items
    };
  });
});