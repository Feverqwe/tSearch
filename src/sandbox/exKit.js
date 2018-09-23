import './baseApi';
import convertCodeV1toV2 from "../tools/convertCodeV1toV2";
import convertCodeV2toV3 from "../tools/convertCodeV2toV3";
import {
  dateFormat as legacyParseDate,
  monthReplace as legacyReplaceMonth,
  sizeFormat as legacySizeFormat,
  todayReplace as legacyReplaceToday
} from '../tools/exKitLegacyFn';
import {ErrorWithCode} from "../tools/errors";
import {parse as fechaParse} from 'fecha';
import {sizzleQuerySelector, sizzleQuerySelectorAll} from "../tools/sizzleQuery";

const filesizeParser = require('filesize-parser');

const exKit = {
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
  intList: ['categoryId', 'size', 'seeds', 'peers', 'date'],
  isUrlList: ['categoryUrl', 'url', 'downloadUrl', 'nextPageUrl'],
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

    return this.request(session, options);
  }

  searchNext(session, url) {
    const options = {
      method: 'GET',
      url: url,
      charset: this.code.search.charset,
    };

    this.setHeaders(options);

    return this.request(session, options);
  }

  parseResponse(session, response) {
    const doc = session.doc = API_getDoc(response.body, response.url);

    if (this.code.hooks.onGetDoc) {
      this.code.hooks.onGetDoc(session, doc);
    }

    if (this.code.auth.loginForm && sizzleQuerySelector(doc, this.code.auth.loginForm.selector)) {
      throw new AuthError(this.code.auth.url);
    }

    const rows = sizzleQuerySelectorAll(doc, this.code.selectors.row.selector);
    if (this.code.selectors.skipFromStart) {
      rows.splice(0, this.code.selectors.skipFromStart);
    }
    if (this.code.selectors.skipFromEnd) {
      rows.splice(this.code.selectors.skipFromEnd * -1);
    }

    const results = [];
    for (let i = 0, row; row = rows[i]; i++) {
      try {
        const result = this.parseRow(session, row);
        results.push(result);
      } catch (err) {
        console.error('parseRow error', err);
      }
    }

    let nextPageUrl = null;
    if (this.code.selectors.nextPageUrl) {
      try {
        nextPageUrl = this.matchSelector(session, doc, 'nextPageUrl', this.code.selectors.nextPageUrl);
      } catch (err) {
        console.error('nextPageUrl matchSelector error', err);
      }
    }

    return {
      results,
      nextPageUrl
    };
  }

  parseRow(session, row) {
    const result = {};
    const errors = [];
    const cache = {};

    ['categoryTitle', 'categoryUrl', 'categoryId', 'title', 'url', 'size', 'downloadUrl', 'seeds', 'peers', 'date'].forEach(key => {
      const selector = this.code.selectors[key];
      if (selector) {
        try {
          result[key] = this.matchSelector(session, row, key, selector, cache);
        } catch (err) {
          // console.log('matchSelector error', err);
          errors.push({
            key: key,
            error: err
          });
        }
      }
    });

    if (!result.title) {
      const err = new Error('Title is not exists');
      err.result = result;
      err.errors = errors;
      throw err;
    }

    if (!result.url) {
      const err = new Error('Url is not exists');
      err.result = result;
      err.errors = errors;
      throw err;
    }

    if (!result.categoryId && result.categoryId !== 0) {
      result.categoryId = -1;
    }

    if (!result.date) {
      result.date = -1;
    }

    if (errors.length) {
      console.warn('parseRow warnings', {row, result, errors});
    }

    return result;
  }

  /**
   * @param session
   * @param container
   * @param {string} key
   * @param {StringSelectorStore|NumberSelectorStore|ElementSelectorStore} selector
   * @param {{}} cache
   */
  matchSelector(session, container, key, selector, cache = {}) {
    let node = cache[selector.selector];
    if (!node) {
      node = cache[selector.selector] = sizzleQuerySelector(container, selector.selector);
    }

    let result = node;

    if (selector.pipelineBuild) {
      result = selector.pipelineBuild(result);
    }

    if (this.code.hooks.transform[key]) {
      result = this.code.hooks.transform[key](session, result, container);
    }

    if (exKit.intList.indexOf(key) !== -1) {
      if (typeof result !== 'number') {
        result = isNumber(parseInt(isString(result), 10));
      }
    } else
    if (exKit.isUrlList.indexOf(key) !== -1) {
      result = API_normalizeUrl(this.code.search.baseUrl || session.response.url, isString(result));
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

  request(session, options) {
    if (this.code.hooks.onBeforeRequest) {
      this.code.hooks.onBeforeRequest(session, options);
    }
    return API_request(options).then(response => {
      session.response = response;

      if (this.code.hooks.onAfterRequest) {
        this.code.hooks.onAfterRequest(session, response);
      }

      return response;
    });
  }

  prepareCode(code) {
    if (code.version === 1) {
      code = convertCodeV1toV2(code);
    }
    if (code.version === 2) {
      code = convertCodeV2toV3(code);
    }

    Object.keys(code.selectors).forEach(key => {
      const value = code.selectors[key];
      if (value && value.pipeline) {
        value.pipelineBuild = this.buildPipeline(value.pipeline);
      }
    });

    if (!code.hooks) {
      code.hooks = {};
    }

    if (!code.hooks.transform) {
      code.hooks.transform = {};
    }

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
          line.push(assertType(isElement, isString, value => value.getAttribute(attr)));
          break;
        }
        case 'getProp': {
          const prop = method.args[0];
          line.push(assertType(isElement, isString, value => value[prop]));
          break;
        }
        case 'getText': {
          line.push(assertType(isNode, isString, value => value.textContent));
          break;
        }
        case 'getHtml': {
          line.push(assertType(isElement, isString, value => value.innerHTML));
          break;
        }
        case 'getChild': {
          const index = method.args[0];
          if (index < 0) {
            line.push(assertType(isNode, isNode, value => value.childNodes[value.childNodes.length + index]));
          } else {
            line.push(assertType(isNode, isNode, value => value.childNodes[index]));
          }
          break;
        }
        case 'trim': {
          line.push(assertType(isString, isString, value => value.trim()));
          break;
        }
        case 'replace': {
          const re = new RegExp(method.args[0], 'ig');
          const replaceTo = method.args[1];
          line.push(assertType(isString, isString, value => value.replace(re, replaceTo)));
          break;
        }
        case 'parseDate': {
          const format = method.args[0];
          line.push(assertType(isString, isNumber, value => fechaParse(value, format).getTime()));
          break;
        }
        case 'parseSize': {
          line.push(assertType(isString, isNumber, value => filesizeParser(value)));
          break;
        }
        case 'toInt': {
          line.push(assertType(isString, isNumber, value => parseInt(value, 10)));
          break;
        }
        case 'toFloat': {
          line.push(assertType(isString, isNumber, value => parseFloat(value)));
          break;
        }
        case 'legacyReplaceToday': {
          line.push(assertType(isString, isString, value => legacyReplaceToday(value)));
          break;
        }
        case 'legacyReplaceMonth': {
          line.push(assertType(isString, isString, value => legacyReplaceMonth(value)));
          break;
        }
        case 'legacyParseDate': {
          const format = method.args[0];
          line.push(assertType(isString, isNumber, value => legacyParseDate(format, value)));
          break;
        }
        case 'legacySizeFormat': {
          line.push(assertType(isString, isNumber, value => legacySizeFormat(value)));
          break;
        }
        default: {
          console.error('Pipeline method is no supported', method.name);
        }
      }
    });

    return value => {
      for (let i = 0, method; method = line[i]; i++) {
        value = method(value);
      }
      return value;
    };
  }
}

window.API_exKit = code => {
  if (!code.version) {
    require('./legacyExKit').API_legacyExKit(code);
    return;
  }

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

  API_event('search', request => {
    const session = {
      tracker: exKitTracker,
      event: 'search',
      request,
    };
    return exKitTracker.search(session, request.query).then(response => {
      return exKitTracker.parseResponse(session, response);
    }).then(onResult);
  });

  API_event('getNextPage', request => {
    const session = {
      tracker: exKitTracker,
      event: 'getNextPage',
      request,
    };
    return exKitTracker.searchNext(session, request.url).then(response => {
      return exKitTracker.parseResponse(session, response);
    }).then(onResult);
  });
};

class AuthError extends Error {
  constructor(url) {
    super('Auth required');
    this.code = 'AUTH_REQUIRED';
    this.url = url;
  }
}

const assertType = (inType, outType, fn) => {
  return value => outType(fn(inType(value)));
};

/**
 * @param value
 * @return {Node}
 */
const isNode = value => {
  if (!value || !value.nodeType) {
    const err = new ErrorWithCode('Value is not Node', 'IS_NOT_NODE');
    err.value = value;
    throw err;
  }
  return value;
};

/**
 * @param value
 * @return {Element}
 */
const isElement = value => {
  if (!value || value.nodeType !== 1) {
    const err = new ErrorWithCode('Value is not Element', 'IS_NOT_ELEMENT');
    err.value = value;
    throw err;
  }
  return value;
};

/**
 * @param value
 * @return {String}
 */
const isString = value => {
  if (typeof value !== 'string') {
    const err = new ErrorWithCode('Value is not String', 'IS_NOT_STRING');
    err.value = value;
    throw err;
  }
  return value;
};

/**
 * @param value
 * @return {Number}
 */
const isNumber = value => {
  if (!Number.isFinite(value)) {
    const err = new ErrorWithCode('Value is not Finite Number', 'IS_NOT_NUMBER');
    err.value = value;
    throw err;
  }
  return value;
};

export default exKit;