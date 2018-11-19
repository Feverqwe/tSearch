// ==UserScript==
// @name __MSG_name__
// @connect *://*.kinopoisk.ru/*
// @version 1.0
// @cacheTTL 86400
// @locale ru {"name": "Сериалы"}
// @locale en {"name": "Series"}
// @defaultLocale en
// ==/UserScript==

const kpGetImgFileName = url => {
  return url.replace(/sm_film/, 'film');
};

const spaceReplace = text => {
  return text.replace(/[\s\xA0]/g, ' ');
};

const parseTitleType = text => {
  const m = /^(.*)\s+\([^)]+\)$/.exec(text);
  if (m) {
    return {
      title: m[1]
    };
  }
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
  const linkNode = item.querySelector('td~td > div > a');
  const url = prop(linkNode, 'href');

  let title = null;
  const titleType = parseTitleType(normText(linkNode));
  if (titleType) {
    title = titleType.title;
  }

  const imgNode = item.querySelector('.poster img[src]');
  const href = prop(imgNode, 'src');
  if (/spacer\.gif$/.test(href)) {
    imgNode.src = imgNode.title;
  }
  const poster = kpGetImgFileName(prop(imgNode, 'src') || '');

  let titleOriginal = null;
  const info = parseInfo(normText(item.querySelector('td~td > div > a~span')));
  if (info) {
    titleOriginal = info.title;
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
  Array.from(doc.querySelectorAll('#itemList > tbody > tr')).forEach(item => {
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
    url: 'http://www.kinopoisk.ru/top/lists/45/perpage/100/'
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