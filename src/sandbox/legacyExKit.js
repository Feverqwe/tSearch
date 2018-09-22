import $ from 'jquery';

const legacyExKit = {
  prepareTrackerR: {
    hasEndSlash: /\/$/
  },
  prepareTracker: function (tracker) {
    const itemList = ['onGetValue', 'onSelectorIsNotFound', 'onEmptySelectorValue'];
    for (let i = 0, item; item = itemList[i]; i++) {
      if (!tracker.search[item]) {
        tracker.search[item] = {};
      }
    }

    if (!tracker.search.requestType) {
      tracker.search.requestType = 'GET';
    } else {
      tracker.search.requestType = tracker.search.requestType.toUpperCase();
    }
    if (tracker.search.rootUrl && !legacyExKit.prepareTrackerR.hasEndSlash.test(tracker.search.rootUrl)) {
      tracker.search.rootUrl = tracker.search.rootUrl + '/';
    }
    if (tracker.search.baseUrl && !legacyExKit.prepareTrackerR.hasEndSlash.test(tracker.search.baseUrl)) {
      tracker.search.baseUrl = tracker.search.baseUrl + '/';
    }
    return tracker;
  },
  parseHtml: function (html, location) {
    return API_getDoc(html, location);
  },
  intList: ['categoryId', 'size', 'seed', 'peer', 'date'],
  isUrlList: ['categoryUrl', 'url', 'downloadUrl', 'nextPageUrl'],
  urlCheck: function (details, tracker, value) {
    return API_normalizeUrl(details.responseUrl, value);
  },
  matchSelector: function (result, details) {
    const _this = this;
    const key = details.key;
    let item = details.item;
    const $dom = details.$dom;
    const tracker = details.tracker;
    const search = tracker.search;
    const error = {};

    if (typeof item === 'string') {
      item = {selector: item};
    }

    let node = $dom.find(item.selector).get(0);

    if (!node && search.onSelectorIsNotFound[key]) {
      node = search.onSelectorIsNotFound[key](details);
    }

    if (item.childNodeIndex !== undefined && node) {
      let childNodeIndex = item.childNodeIndex;
      if (childNodeIndex < 0) {
        childNodeIndex = node.childNodes.length + item.childNodeIndex;
      }
      node = node.childNodes[childNodeIndex];
    }

    if (!node) {
      error[key] = node;
      error[key + '!'] = 'Selector is not found!';
      error[key + 'Selector'] = item.selector;
      return;
    }

    let value = null;
    if (item.attr) {
      value = node.getAttribute(item.attr);
    } else
    if (item.prop) {
      value = node[item.prop];
    } else if (item.html) {
      value = node.innerHTML;
    } else {
      value = node.textContent;
    }
    if (value) {
      value = $.trim(value);
    }

    if (!value && search.onEmptySelectorValue[key]) {
      value = search.onEmptySelectorValue[key](details);
    }

    if (!value && value !== 0) {
      error[key] = value;
      if (item.attr) {
        error[key + '!'] = 'Attribute is not found!';
      } else
      if (item.prop) {
        error[key + '!'] = 'Property is not found!';
      } else if (item.html) {
        error[key + '!'] = 'Html content is empty!';
      } else {
        error[key + '!'] = 'Text content is empty!';
      }
      return;
    }

    if (search.onGetValue[key]) {
      value = search.onGetValue[key](details, value);
    }

    if (legacyExKit.intList.indexOf(key) !== -1) {
      let intValue = parseInt(value);
      if (isNaN(intValue)) {
        intValue = -1;
        error[key] = value;
        error[key + '!'] = 'isNaN';
      }
      value = intValue;
    } else {
      if (legacyExKit.isUrlList.indexOf(key) !== -1) {
        value = legacyExKit.urlCheck(details, tracker, value);
      }
    }

    result[key] = value;
  },
  matchTorrentSelector: function (trObj, details) {
    const _this = this;
    const key = details.key;
    let item = details.item;
    const $node = details.$node;
    const tracker = details.tracker;
    const search = tracker.search;

    if (typeof item === 'string') {
      item = {selector: item};
    }

    let node = trObj.cache[item.selector];
    if (!node) {
      node = trObj.cache[item.selector] = $node.find(item.selector).get(0);
    }

    if (!node && search.onSelectorIsNotFound[key]) {
      node = search.onSelectorIsNotFound[key](details);
    }

    if (item.childNodeIndex !== undefined && node) {
      let childNodeIndex = item.childNodeIndex;
      if (childNodeIndex < 0) {
        childNodeIndex = node.childNodes.length + item.childNodeIndex;
      }
      node = node.childNodes[childNodeIndex];
    }

    if (!node) {
      trObj.error[key] = node;
      trObj.error[key + '!'] = 'Selector is not found!';
      trObj.error[key + 'Selector'] = item.selector;
      return;
    }

    let value = null;
    if (item.attr) {
      value = node.getAttribute(item.attr);
    } else
    if (item.prop) {
      value = node[item.prop];
    } else if (item.html) {
      value = node.innerHTML;
    } else {
      value = node.textContent;
    }
    if (value) {
      value = $.trim(value.replace(/\r?\n/g, ' '));
    }

    if (!value && search.onEmptySelectorValue[key]) {
      value = search.onEmptySelectorValue[key](details);
    }

    if (!value && value !== 0) {
      trObj.error[key] = value;
      if (item.attr) {
        trObj.error[key + '!'] = 'Attribute is not found!';
      } else
      if (item.prop) {
        trObj.error[key + '!'] = 'Property is not found!';
      } else if (item.html) {
        trObj.error[key + '!'] = 'Html content is empty!';
      } else {
        trObj.error[key + '!'] = 'Text content is empty!';
      }
      return;
    }

    if (search.onGetValue[key]) {
      value = search.onGetValue[key](details, value);
    }

    if (legacyExKit.intList.indexOf(key) !== -1) {
      let intValue = parseInt(value);
      if (isNaN(intValue)) {
        intValue = -1;
        trObj.error[key] = value;
        trObj.error[key + '!'] = 'isNaN';
      }
      value = intValue;
    } else {
      if (legacyExKit.isUrlList.indexOf(key) !== -1) {
        value = legacyExKit.urlCheck(details, tracker, value);
      }
    }

    trObj.column[key] = value;

    return value;
  },
  isEmptyObject: function (obj) {
    for (let item in obj) {
      return false;
    }
    return true;
  },
  matchTorrentItem: function ($node, details) {
    const _this = this;
    details.$node = $node;

    const tracker = details.tracker;
    const search = tracker.search;

    if (search.onGetListItem) {
      search.onGetListItem(details);
    }

    const trObj = Object.create({cache: {}});
    trObj.column = {};
    trObj.error = {};

    for (let key in search.torrentSelector) {
      const selDetails = Object.create(details);

      selDetails.item = search.torrentSelector[key];
      selDetails.key = key;

      _this.matchTorrentSelector(trObj, selDetails);
    }

    if (!trObj.column.title || !trObj.column.url) {
      console.debug('[' + tracker.id + ']', 'Skip torrent:', trObj);
      return;
    }

    if (!trObj.column.categoryId && trObj.column.categoryId !== 0) {
      trObj.column.categoryId = -1;
    }

    if (!trObj.column.date) {
      trObj.column.date = -1;
    }

    if (!_this.isEmptyObject(trObj.error)) {
      console.debug('[' + tracker.id + ']', 'Torrent has problems:', trObj);
    }

    return trObj.column;
  },
  parseDom: function (details) {
    const _this = this;
    const tracker = details.tracker;
    const search = tracker.search;

    if (search.onBeforeDomParse) {
      search.onBeforeDomParse(details);
    }

    if (details.result) {
      return details.result;
    }

    const dom = legacyExKit.parseHtml(details.data, details.responseUrl);
    const $dom = details.$dom = $(dom);

    if (search.onAfterDomParse) {
      search.onAfterDomParse(details);
      if (details.result) {
        return details.result;
      }
    }

    if (search.loginFormSelector && $dom.find(search.loginFormSelector).length) {
      return {requireAuth: 1};
    }

    const torrentElList = $dom.find(search.listItemSelector);

    if (search.listItemSplice) {
      if (search.listItemSplice[0] !== 0) {
        torrentElList.splice(0, search.listItemSplice[0]);
      }
      if (search.listItemSplice[1] !== 0) {
        torrentElList.splice(search.listItemSplice[1]);
      }
    }

    const resultObj = {};

    const torrentList = resultObj.torrentList = [];

    let item;
    for (let i = 0, len = torrentElList.length; i < len; i++) {
      item = _this.matchTorrentItem(torrentElList.eq(i), Object.create(details));
      item && torrentList.push(item);
    }

    if (search.nextPageSelector) {
      const selDetails = Object.create(details);

      selDetails.item = search.nextPageSelector;
      selDetails.key = 'nextPageUrl';

      _this.matchSelector(resultObj, selDetails);
    }

    return resultObj;
  },
  search: function (tracker, _details) {
    const _this = this;

    const query = _details.query;

    const details = {
      tracker: tracker,
      query: query
    };

    let charset = tracker.search.charset;
    if (!charset && tracker.search.requestMimeType) {
      const m = /charset=([^;]+)/.exec(tracker.search.requestMimeType);
      if (m) {
        charset = m[1];
      }
    }

    if (tracker.search.onBeforeRequest) {
      tracker.search.onBeforeRequest(details);
    } else {
      details.query = encodeURIComponent(details.query);
    }

    const requestOptions = {};

    let headers = {};
    if (tracker.search.requestHeaders) {
      headers = JSON.parse(tracker.search.requestHeaders);
    }

    if (!_details.url) {
      Object.assign(requestOptions, {
        method: tracker.search.requestType,
        url: tracker.search.searchUrl.replace('%search%', details.query),
        data: (tracker.search.requestData || '').replace('%search%', details.query),
        charset: charset,
        headers: headers,
      });
    } else {
      Object.assign(requestOptions, {
        method: 'GET',
        url: _details.url
      });
    }

    return API_request(requestOptions).then(function (response) {
      details.data = response.body;
      details.responseUrl = response.url;
      details.requestUrl = requestOptions.url;
    }).then(function () {
      if (tracker.search.onAfterRequest) {
        tracker.search.onAfterRequest(details);
        if (details.result) {
          return details.result;
        }
      }

      return _this.parseDom(details);
    }).then(function (result) {
      if (result.requireAuth) {
        result.requireAuth = tracker.search.loginUrl;
      }

      return result;
    });
  },
};

const API_legacyExKit = function (trackerObj) {
  const tracker = trackerObj;
  legacyExKit.prepareTracker(tracker);

  const search = function (query, nextPageUrl) {
    return legacyExKit.search(tracker, {
      query: query,
      url: nextPageUrl
    }).then(function (result) {
      if (result.requireAuth) {
        const err = new Error('Auth required');
        err.code = 'AUTH_REQUIRED';
        err.url = result.requireAuth;
        throw err;
      }

      return {
        success: true,
        results: result.torrentList.map(item => {
          return {
            categoryTitle: item.categoryTitle,
            categoryUrl: item.categoryUrl,
            categoryId: item.categoryId,
            title: item.title,
            url: item.url,
            size: item.size,
            downloadUrl: item.downloadUrl,
            seeds: item.seed,
            peers: item.peer,
            date: item.date,
          };
        }),
        nextPageRequest: result.nextPageUrl && {
          event: 'getNextPage',
          url: result.nextPageUrl,
          query: query
        }
      };
    });
  };

  API_event('getNextPage', function (request) {
    return search(request.query, request.url);
  });

  API_event('search', function (request) {
    return search(request.query);
  });
};

export {API_legacyExKit};