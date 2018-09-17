import $ from 'jquery';
import './baseApi';
import convertCodeV1toV2 from "../tools/convertCodeV1toV2";
import convertCodeV2toV3 from "../tools/convertCodeV2toV3";
import moment from "moment";
import {
  sizeFormat as legacySizeFormat,
  monthReplace as legacyReplaceMonth,
  todayReplace as legacyReplaceToday,
  dateFormat as legacyParseDate
} from '../tools/exKitLegacyFn';

const filesizeParser = require('filesize-parser');

const exKit = {
  prepareTrackerR: {
    hasEndSlash: /\/$/
  },
  funcList: {
    encodeCp1251: function (string) {
      let output = '', charCode, ExitValue, char;
      for (let i = 0, len = string.length; i < len; i++) {
        char = string.charAt(i);
        charCode = char.charCodeAt(0);
        let Acode = charCode;
        if (charCode > 1039 && charCode < 1104) {
          Acode -= 848;
          ExitValue = '%' + Acode.toString(16);
        }
        else if (charCode === 1025) {
          Acode = 168;
          ExitValue = '%' + Acode.toString(16);
        }
        else if (charCode === 1105) {
          Acode = 184;
          ExitValue = '%' + Acode.toString(16);
        }
        else if (charCode === 32) {
          Acode = 32;
          ExitValue = '%' + Acode.toString(16);
        }
        else if (charCode === 10) {
          ExitValue = '%0A';
        }
        else {
          ExitValue = char;
        }
        output = output + ExitValue;
      }
      return output;
    },
    idInCategoryList: function (tracker, cId) {
      const mapNameId = {
        serials: 0,
        music: 1,
        games: 2,
        films: 3,
        cartoon: 4,
        books: 5,
        soft: 6,
        anime: 7,
        doc: 8,
        sport: 9,
        xxx: 10,
        humor: 11
      };

      for (let key in tracker.categoryList) {
        const list = tracker.categoryList[key];
        if (list.indexOf(cId) !== -1) {
          return mapNameId[key];
        }
      }

      return -1;
    },
    idInCategoryListInt: function (tracker, url, regexp) {
      let cId = url.match(regexp);
      cId = cId && cId[1];
      if (cId === null) {
        return -1;
      }
      cId = parseInt(cId);
      return this.idInCategoryList(tracker, cId);
    },
    idInCategoryListStr: function (tracker, url, regexp) {
      let cId = url.match(regexp);
      cId = cId && cId[1];
      if (cId === null) {
        return -1;
      }
      return this.idInCategoryList(tracker, cId);
    }
  },
  listToFunction: function (key, list) {
    if (!Array.isArray(list)) {
      return null;
    }

    const funcList = [];
    list.forEach(function (item) {
      if (item.name === 'encode') {
        if (item.type === 'cp1251') {
          funcList.push(function (details) {
            details.query = exKit.funcList.encodeCp1251(details.query);
          });
        }
      } else if (item.name === 'replaceRe') {
        const re = new RegExp(item.re, 'ig');
        funcList.push(function (details, value) {
          return value.replace(re, item.text);
        });
      } else if (item === 'replaceToday') {
        funcList.push(function (details, value) {
          return exKit.funcList.todayReplace(value);
        });
      } else if (item === 'replaceMonth') {
        funcList.push(function (details, value) {
          return exKit.funcList.monthReplace(value);
        });
      } else if (item.name === 'timeFormat') {
        funcList.push(function (details, value) {
          return exKit.funcList.dateFormat(item.format, value);
        });
      } else if (item === 'convertSize') {
        funcList.push(function (details, value) {
          return exKit.funcList.sizeFormat(value);
        });
      }
    });

    if (!funcList.length) {
      return null;
    }

    return function (details, value) {
      for (let i = 0, _func; _func = funcList[i]; i++) {
        try {
          value = _func(details, value);
        } catch (err) {
          value = null;
          console.error('listToFunction error!', err);
          break;
        }
      }
      return value;
    }
  },
  prepareCustomTracker: function (code) {
    const _this = this;

    if (code.version === 1) {
      code = convertCodeV1toV2(code);
    }

    /*if (code.version === 2) {
      code = convertCodeV2toV3(code);
    }*/

    if (code.version === 2) {
      let id = '';
      const params = location.hash.substr(1).split('&');
      params.some(function (item) {
        const keyValue = item.split('=');
        if (keyValue[0] === 'id') {
          id = keyValue[1];
          return true;
        }
      });
      code.id = id || 'noTrackerId';

      code.search = code.search || {};

      ['onBeforeRequest', 'onAfterRequest', 'onBeforeDomParse', 'onAfterDomParse', 'onGetListItem'].forEach(function (key) {
        code.search[key] = _this.listToFunction(key, code.search[key]);
      });

      ['onSelectorIsNotFound', 'onEmptySelectorValue', 'onGetValue'].forEach(function (sectionName) {
        const section = code.search[sectionName];
        for (let key in section) {
          section[key] = _this.listToFunction(sectionName, section[key]);
        }
      });
    }

    return code;
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
    if (tracker.search.rootUrl && !exKit.prepareTrackerR.hasEndSlash.test(tracker.search.rootUrl)) {
      tracker.search.rootUrl = tracker.search.rootUrl + '/';
    }
    if (tracker.search.baseUrl && !exKit.prepareTrackerR.hasEndSlash.test(tracker.search.baseUrl)) {
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

    if (exKit.intList.indexOf(key) !== -1) {
      let intValue = parseInt(value);
      if (isNaN(intValue)) {
        intValue = -1;
        error[key] = value;
        error[key + '!'] = 'isNaN';
      }
      value = intValue;
    } else {
      if (exKit.isUrlList.indexOf(key) !== -1) {
        value = exKit.urlCheck(details, tracker, value);
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

    if (exKit.intList.indexOf(key) !== -1) {
      let intValue = parseInt(value);
      if (isNaN(intValue)) {
        intValue = -1;
        trObj.error[key] = value;
        trObj.error[key + '!'] = 'isNaN';
      }
      value = intValue;
    } else {
      if (exKit.isUrlList.indexOf(key) !== -1) {
        value = exKit.urlCheck(details, tracker, value);
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

    const dom = exKit.parseHtml(details.data, details.responseUrl);
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
exKit.funcList.dateFormat = legacyParseDate;
exKit.funcList.monthReplace = legacyReplaceMonth;
exKit.funcList.sizeFormat = legacySizeFormat;
exKit.funcList.todayReplace = legacyReplaceToday;

window.exKit = exKit;

class ExKitTracker {
  constructor(code) {
    this.code = this.prepareCode(code);
  }
  search(session, query) {
    let encodedQuery = null;
    if (this.code.search.encoding === 'cp1251') {
      encodedQuery = exKit.funcList.encodeCp1251(query);
    } else {
      encodedQuery = encodeURIComponent(query);
    }

    const options = {
      method: this.code.search.method,
      url: this.code.search.url.replace('%search%', encodedQuery),
      query: this.code.search.query.replace('%search%', encodedQuery),
      body: this.code.search.body.replace('%search%', encodedQuery),
      charset: this.code.search.charset,
    };

    this.setHeaders(options);

    if (this.code.search.onBeforeRequest) {
      this.code.search.onBeforeRequest(session, options);
    }

    return API_request(options);
  }
  searchNext(session, url) {
    const options = {
      method: 'GET',
      url: url,
      charset: this.code.search.charset,
    };

    this.setHeaders(options);

    if (this.code.search.onBeforeRequest) {
      this.code.search.onBeforeRequest(session, options);
    }

    return API_request(options);
  }
  parseResponse(session, response) {
    if (this.code.search.onAfterRequest) {
      const result = {};
      this.code.search.onAfterRequest(result, session);
      if (result.result) {
        return this.handleHookResult(result.result);
      }
    }

    if (this.code.search.onBeforeDomParse) {
      this.code.search.onBeforeDomParse(session);
    }

    const dom = session.dom = API_getDoc(response.body, response.url);
    const $dom = session.$dom = $(dom);

    if (this.code.search.onAfterDomParse) {
      const result = {};
      this.code.search.onAfterDomParse(result, session);
      if (result.result) {
        return this.handleHookResult(result.result);
      }
    }

    if (this.code.auth.selector && $dom.find(this.code.auth.selector).length) {
      throw new AuthError(this.code);
    }

    const rows = $dom.find(this.code.search.row);
    if (this.code.search.skipFromStart) {
      rows.splice(0, this.code.search.skipFromStart);
    }
    if (this.code.search.skipFromEnd) {
      rows.splice(this.code.search.skipFromEnd * -1);
    }

    const results = rows;
    rows.forEach(row => {
      try {
        const result = this.parseRow(row);
        results.push(result);
      } catch (err) {
        console.error('parseRow error', err);
      }
    });

    let nextPageUrl = null;
    if (this.code.search.nextPageLink) {
      try {
        nextPageUrl = this.matchSelector('nextPageLink', session, this.code.search.nextPageLink);
      } catch (err) {
        console.error('nextPageLink matchSelector error', err);
      }
    }

    return {
      results,
      nextPageUrl
    };
  }

  /**
   * @param {string} id
   * @param session
   * @param {StringSelectorStore|NumberSelectorStore|ElementSelectorStore} selector
   */
  matchSelector(id, session, selector) {
    const {$dom} = session;

    let result = $dom.find(selector.selector).get(0);

    if (selector.pipelineBuild) {
      result = selector.pipelineBuild(result);
    }

    return result;
  }
  handleHookResult(result) {
    if (result.requireAuth) {
      throw new AuthError(this.code);
    }
    return result;
  }
  setHeaders(options) {
    let headers = null;
    if (this.code.search.headers) {
      headers = JSON.parse(this.code.search.headers);
    }
    options.headers = headers;
  }
  prepareCode(code) {
    if (code.version === 1) {
      code = convertCodeV1toV2(code);
    }
    if (code.version === 2) {
      code = convertCodeV2toV3(code);
    }

    if (code.search.baseUrl && !/\/$/.test(code.search.baseUrl)) {
      code.search.baseUrl = code.search.baseUrl + '/';
    }

    Object.keys(code.search).forEach(key => {
      const value = code.search[key];
      if (value && value.pipeline) {
        value.pipelineBuild = this.buildPipeline(value.pipeline);
      }
    });

    return code;
  }
  buildPipeline(pipeline) {
    if (!Array.isArray(pipeline) || !pipeline.length) {
      return null;
    }

    const line = [];
    pipeline.forEach(method => {
      switch (method.name) {
        case 'getAttr': {
          const attr = method.args[0];
          line.push(value => value.getAttribute(attr));
          break;
        }
        case 'getProp': {
          const prop = method.args[0];
          line.push(value => value[prop]);
          break;
        }
        case 'getText': {
          line.push(value => value.textContent);
          break;
        }
        case 'getHtml': {
          line.push(value => value.innerHTML);
          break;
        }
        case 'getChild': {
          const index = method.args[0];
          line.push(value => value.childNodes[index]);
          break;
        }
        case 'replace': {
          const re = new RegExp(method.args[0], 'ig');
          const replaceTo = method.args[1];
          line.push(value => value.replace(re, replaceTo));
          break;
        }
        case 'parseDate': {
          const formats = method.args;
          line.push(value => moment(value, formats).unix());
          break;
        }
        case 'parseSize': {
          line.push(value => filesizeParser(value));
          break;
        }
        case 'toInt': {
          line.push(value => parseInt(value, 10));
          break;
        }
        case 'toFloat': {
          line.push(value => parseFloat(value));
          break;
        }
        case 'legacyReplaceToday': {
          line.push(value => legacyReplaceToday(value));
          break;
        }
        case 'legacyReplaceMonth': {
          line.push(value => legacyReplaceMonth(value));
          break;
        }
        case 'legacyParseDate': {
          line.push(value => legacyParseDate(method.args[0], value));
          break;
        }
        case 'legacySizeFormat': {
          line.push(value => legacySizeFormat(value));
          break;
        }
      }
    });

    return value => {
      for (let i = 0, method; method = line[i]; i++) {
        try {
          value = method(value);
        } catch (err) {
          value = null;
          console.error('Call pipepine error!', err);
          break;
        }
      }
      return value;
    };
  }
}

window.API_exKit = function (code) {
  const exKitTracker = new ExKitTracker(code);

  const onResult = result => {
    let nextPageRequest = null;
    if (result.nextPageUrl) {
      nextPageRequest = {
        url: result.nextPageUrl,
      }
    }

    return {
      success: true,
      results: result.results,
      nextPageRequest: nextPageRequest,
    };
  };

  API_event('search', function (request) {
    const session = {
      cache: {},
      eventName: 'search',
      request,
    };
    return exKitTracker.search(session, request.query).then(response => {
      return exKitTracker.parseResponse(session, response);
    }).then(onResult);
  });

  API_event('getNextPage', function (request) {
    const session = {
      cache: {},
      eventName: 'getNextPage',
      request,
    };
    return exKitTracker.searchNext(session, request.url).then(response => {
      return exKitTracker.parseResponse(session, response);
    }).then(onResult);
  });
};

class AuthError extends Error {
  constructor(code) {
    super('Auth required');
    this.code = 'AUTH_REQUIRED';
    this.url = code.auth.url;
  }
}

export default exKit;