import {sizzleQuerySelector, sizzleQuerySelectorAll} from "../tools/sizzleQuery";
import convertCodeV1toV2 from "../tools/convertCodeV1toV2";
import convertCodeV2toV3 from "../tools/convertCodeV2toV3";
import encodeCp1251 from "../tools/encodeCp1251";
import {isNumber, isString} from "../tools/assertType";
import exKitPipelineMethods from "../tools/exKitPipelineMethods";

const strFields = ['categoryTitle', 'title'];
const intFields = ['categoryId', 'size', 'seeds', 'peers', 'date'];
const urlFields = ['categoryUrl', 'url', 'downloadUrl', 'nextPageUrl'];

class ExKitTracker {
  constructor() {
    this.code = null;
  }

  init(code) {
    return this.prepareCode(code).then(code => {
      this.code = code;
    });
  }

  search(session, query) {
    const searchStore = this.code.search;

    let encodedQuery = null;
    if (searchStore.encoding === 'cp1251') {
      encodedQuery = encodeCp1251(query);
    } else {
      encodedQuery = encodeURIComponent(query);
    }

    const options = {
      method: searchStore.method,
      url: searchStore.url.replace('%search%', encodedQuery),
      originUrl: searchStore.originUrl,
      query: (searchStore.query || '').replace('%search%', encodedQuery),
      body: (searchStore.body || '').replace('%search%', encodedQuery),
      charset: searchStore.charset,
    };

    this.setHeaders(options);

    return this.request(session, options);
  }

  searchNext(session, url) {
    const searchStore = this.code.search;

    const options = {
      method: 'GET',
      url: url,
      originUrl: searchStore.originUrl,
      charset: searchStore.charset,
    };

    this.setHeaders(options);

    return this.request(session, options);
  }

  parseResponse(session, response) {
    const doc = session.doc = API_getDoc(response.body, response.url);

    if (this.code.hooks.onGetDoc) {
      this.code.hooks.onGetDoc(session, doc);
    }

    if (this.code.auth && this.code.auth.loginForm && sizzleQuerySelector(doc, this.code.auth.loginForm.selector)) {
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

    if (intFields.indexOf(key) !== -1) {
      if (typeof result !== 'number') {
        result = isNumber(parseInt(isString(result), 10));
      } else {
        result = isNumber(result);
      }
    } else
    if (urlFields.indexOf(key) !== -1) {
      result = API_normalizeUrl(session.response.url, isString(result));
    } else
    if (strFields.indexOf(key) !== -1) {
      result = isString(result);
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
    return Promise.resolve().then(() => {
      if (code.version === 1) {
        code = convertCodeV1toV2(code);
      }

      if (code.version === 2) {
        code = convertCodeV2toV3(code);
      }

      if (!code.hooks) {
        code.hooks = {};
      }

      if (!code.hooks.transform) {
        code.hooks.transform = {};
      }

      const promiseList = Object.keys(code.selectors).map(key => {
        const value = code.selectors[key];
        if (value && value.pipeline) {
          return this.buildPipeline(value.pipeline).then(pipelineBuild => {
            value.pipelineBuild = pipelineBuild;
          });
        }
      });

      return Promise.all(promiseList).then(() => code);
    });
  }

  buildPipeline(pipeline) {
    return Promise.resolve().then(() => {
      if (!Array.isArray(pipeline) || !pipeline.length) {
        return null;
      }

      const promiseList = pipeline.map(method => {
        const pipelineMethod = exKitPipelineMethods[method.name];
        const args = method.args || [];
        return pipelineMethod.getMethod(...args);
      });

      return Promise.all(promiseList).then(line => {
        return value => {
          for (let i = 0, method; method = line[i]; i++) {
            value = method(value);
          }
          return value;
        };
      });
    });
  }
}

class AuthError extends Error {
  constructor(url) {
    super('Auth required');
    this.code = 'AUTH_REQUIRED';
    this.url = url;
  }
}

export default ExKitTracker;