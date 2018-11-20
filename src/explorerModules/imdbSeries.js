// ==UserScript==
// @name __MSG_name__
// @connect *://*.imdb.com/*
// @version 1.0
// @cacheTTL 86400
// @locale ru {"name": "IMDB: Сериалы"}
// @locale en {"name": "IMDB: TV Series"}
// @defaultLocale en
// ==/UserScript==

const imdbGetImgFilename = url => {
  return url.replace(/(\/images\/.+)_V1.*$/, '$1_V1_SX120_.jpg');
};

const spaceReplace = text => {
  return text.replace(/[\s\xA0]/g, ' ');
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
  const imgNode = item.querySelector('.lister-item-image img[loadlate]');
  if (imgNode) {
    imgNode.src = imgNode.getAttribute('loadlate');
  }
  const poster = imdbGetImgFilename(prop(imgNode, 'src') || '');

  const linkNode = item.querySelector('.lister-item-header > a');
  const url = rmRef(prop(linkNode, 'href'));
  let title = normText(linkNode);

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
  Array.from(doc.querySelectorAll('.lister-list > .lister-item')).forEach(item => {
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
    url: `https://www.imdb.com/search/title?count=100&title_type=tv_series`
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