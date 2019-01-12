// ==UserScript==
// @name __MSG_name__
// @downloadURL https://raw.githubusercontent.com/Feverqwe/tSearch/master/src/explorerModules/imdbInCinema.js
// @connect *://*.imdb.com/*
// @version 1.2
// @cacheTTL 86400
// @locale ru {"name": "IMDB: Сейчас в кино"}
// @locale en {"name": "IMDB: Now in movie"}
// @defaultLocale en
// ==/UserScript==

const imdbGetImgFilename = url => {
  return url.replace(/(\/images\/.+)_V1.*$/, '$1_V1_SX120_.jpg');
};

const spaceReplace = text => {
  return text.replace(/[\s\xA0]/g, ' ');
};

const parseTitleYear = text => {
  const m = /^(.*)\s+\((\d{4})\)$/.exec(text);
  if (m) {
    return {
      title: m[1],
      year: parseInt(m[2], 10)
    };
  }
};

const rmRef = url => {
  return url.replace(/\?ref.*$/, '');
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
  const poster = imdbGetImgFilename(prop(item.querySelector('div.image img[src]'), 'src') || '');

  const linkNode = item.querySelector('.overview-top a');
  const url = rmRef(prop(linkNode, 'href'));

  let title = null;
  let year = null;
  const titleInfo = parseTitleYear(normText(linkNode));
  if (titleInfo) {
    title = titleInfo.title;
    year = titleInfo.year;
  }

  if (year) {
    if (title) {
      title += ' ' + year;
    }
  }

  const result = {
    title: title,
    url: url
  };

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
  Array.from(doc.querySelectorAll('table.nm-title-overview-widget-layout')).forEach(item => {
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
    url: `https://www.imdb.com/movies-in-theaters/`,
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