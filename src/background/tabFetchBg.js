import promiseFinally from "../tools/promiseFinally";
import {ErrorWithCode} from "../tools/errors";
import debounce from "lodash.debounce";
import getLogger from "../tools/getLogger";

const deserializeError = require('deserialize-error');

const logger = getLogger('TabFetchBg');

const DEBUG = false;

class TabFetchBg {
  constructor() {
    this.tabIds = [];
    this.urlTabId = new Map();
    this.requestId = 0;
    this.idRequest = new Map();
    this.urlPromise = new Map();
  }
  async request(senderTabId, originUrl, fetchUrl, fetchOptions) {
    DEBUG && logger.log('search', originUrl);

    this.addTab(senderTabId);

    const request = {
      id: ++this.requestId,
      tabId: null,
      inited: false,
      sessionId: 0,
    };

    this.idRequest.set(request.id, request);

    request.promise = new Promise((resolve, reject) => {
      request.handleResolve = resolve;
      request.handleReject = reject;
    }).then(...promiseFinally(() => {
      this.idRequest.delete(request.id);
      this.closeTabIfIdleDebounce();
    }));

    request.init = () => {
      if (request.inited) return request.promise;
      request.inited = true;

      const sessionId = ++request.sessionId;
      Promise.resolve().then(async () => {
        let tabId = this.urlTabId.get(originUrl);
        if (!tabId) {
          tabId = await this.createPopupWindow(originUrl);
          this.urlTabId.set(originUrl, tabId);
        }

        request.tabId = tabId;

        await executeScriptPromise(request.tabId, {
          file: 'tabFetch.js',
          runAt: 'document_start',
        });

        if (sessionId !== request.sessionId) return;

        const result = await executeScriptPromise(request.tabId, {
          code: `(${function (id, url, options) {
            try {
              window.tabFetch(id, url, options);
              return {result: true};
            } catch (err) {
              return {error: {message: err.message, stack: err.stack}};
            }
          }})(${strArgs(request.id, fetchUrl, fetchOptions)})`,
          runAt: 'document_start',
        }).then(results => results[0]);

        if (sessionId !== request.sessionId) return;

        if (!result || result.error) {
          request.handleReject(!result ? new Error('tabFetch error') : deserializeError(result.error));
        }
      });

      return request.promise;
    };

    request.abort = () => {
      executeScriptPromise(request.tabId, {
        code: `(${function (id) {
          try {
            window.tabFetchAbort(id);
          } catch (err) {
            logger.error('tabFetchAbort error', err);
          }
        }})(${strArgs(request.id)})`,
        runAt: 'document_start',
      });
    };

    return request.id;
  }
  handleResponse(id, result) {
    DEBUG && logger.log('handleResponse', id);
    const request = this.idRequest.get(id);
    if (request) {
      if (result.error) {
        request.handleReject(deserializeError(result.error));
      } else {
        request.handleResolve(result.result);
      }
    }
  }
  initRequest(id) {
    DEBUG && logger.log('initRequest', id);
    const request = this.idRequest.get(id);
    return request.init();
  }
  abortRequest(id) {
    DEBUG && logger.log('abortRequest', id);
    const request = this.idRequest.get(id);
    return request.abort();
  }
  addTab(id) {
    DEBUG && logger.log('addTab', id);
    if (this.tabIds.indexOf(id) === -1) {
      this.tabIds.push(id);
    }
    if (this.tabIds.length === 1) {
      chrome.tabs.onRemoved.addListener(this.tabRemovedListener);
      chrome.tabs.onUpdated.addListener(this.tabUpdatedListener);
    }
  }
  tabUpdatedListener = (tabId, changeInfo) => {
    if (!changeInfo.url) return;
    DEBUG && logger.log('tabUpdatedListener', tabId, changeInfo.url);

    let url = null;
    this.urlTabId.forEach((id, _url) => {
      if (tabId === id) {
        url = _url;
      }
    });

    if (url) {
      this.idRequest.forEach((request) => {
        if (request.tabId === tabId) {
          request.inited = false;
          request.init();
        }
      });
    }
  };
  tabRemovedListener = (tabId) => {
    DEBUG && logger.log('tabRemovedListener', tabId);
    let url = null;
    this.urlTabId.forEach((id, _url) => {
      if (tabId === id) {
        url = _url;
      }
    });
    if (url) {
      this.urlTabId.delete(url);
    }

    this.idRequest.forEach((request) => {
      if (request.tabId === tabId) {
        request.handleReject(new ErrorWithCode('Tab is closed', 'TAB_IS_CLOSED'));
      }
    });

    const pos = this.tabIds.indexOf(tabId);
    if (pos !== -1) {
      this.tabIds.splice(pos, 1);
    }

    if (!this.tabIds.length) {
      this.destroy();
    }
  };
  createPopupWindow(originUrl) {
    DEBUG && logger.log('createPopupWindow', originUrl);
    let promise = this.urlPromise.get(originUrl);
    if (!promise) {
      promise = createPopup(originUrl).then(...promiseFinally(() => {
        this.urlPromise.delete(originUrl);
      }));
      this.urlPromise.set(originUrl, promise);
    }
    return promise;
  }
  closeTabIfIdleDebounce = debounce(this.closeTabIfIdle.bind(this), 250);
  closeTabIfIdle() {
    DEBUG && logger.log('closeTabIfIdle');
    this.urlTabId.forEach((tabId) => {
      const hasRequest = Array.from(this.idRequest.values()).some((request) => {
        return request.tabId === tabId;
      });
      if (!hasRequest) {
        DEBUG && logger.log('closeTabIfIdle remove tab', tabId);
        chrome.tabs.remove(tabId);
      }
    });
  }
  destroy() {
    DEBUG && logger.log('destroy');
    this.urlTabId.forEach((id) => {
      chrome.tabs.remove(id);
    });
    chrome.tabs.onUpdated.removeListener(this.tabUpdatedListener);
    chrome.tabs.onRemoved.removeListener(this.tabRemovedListener);
  }
}

const createPopup = (originUrl) => {
  return new Promise(resolve => chrome.windows.create({
    url: originUrl,
    focused: false,
    width: 120,
    height: 28,
    left: screen.availWidth,
    top: screen.availHeight,
    type: 'popup',
  }, resolve)).then((window) => {
    const tabId = window.tabs[0].id;
    chrome.tabs.update(tabId, {muted: true});
    return tabId;
  });
};

const executeScriptPromise = (tabId, options) => {
  DEBUG && logger('executeScriptPromise', tabId, options.file);
  return new Promise((resolve, reject) => {
    chrome.tabs.executeScript(tabId, options, (results) => {
      const err = chrome.runtime.lastError;
      err ? reject(err) : resolve(results);
    });
  });
};

const strArgs = (...args) => {
  return args.map(JSON.stringify).join(',');
};

export default TabFetchBg;