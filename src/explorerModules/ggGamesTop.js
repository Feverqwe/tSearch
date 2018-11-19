// ==UserScript==
// @name __MSG_name__
// @connect *://*.gameguru.ru/*
// @version 1.0
// @cacheTTL 86400
// @locale ru {"name": "Игры: Лучшие"}
// @locale en {"name": "Games: Best"}
// @defaultLocale en
// ==/UserScript==

const spaceReplace = text => {
  return text.replace(/[\s\xA0]/g, ' ');
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
  const poster = prop(item.querySelector('.V7-img img[src]'), 'src');

  const linkNode = item.querySelector('.V7-title a');
  const url = prop(linkNode, 'href');
  const title = normText(linkNode);

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
  Array.from(doc.querySelectorAll('.V7-blocks > .V7-block')).forEach(item => {
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
  [1, 2, 3, 4, 5].forEach(page => {
    promise = promise.then(() => {
      return API_request({
        method: 'GET',
        url: `http://gameguru.ru/pc/games/rated/page${page}/list.html`
      }).then(response => {
        return onPageLoad(response);
      }).then(_items => {
        items.push(..._items);
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