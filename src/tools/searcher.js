import promiseFinally from "./promiseFinally";
import {ErrorWithCode} from "./errors";
import debounce from "lodash.debounce";
import getLogger from "./getLogger";

const deserializeError = require('deserialize-error');

const logger = getLogger('Searcher');

const DEBUG = false;

class Searcher {
  constructor() {
    this.tabIds = [];
    this.urlTabId = new Map();
    this.requestId = 0;
    this.idRequest = new Map();
    this.urlPromise = new Map();
    this.loadingTabIds = [];
  }
  async search(senderTabId, originUrl, fetchUrl, fetchOptions) {
    DEBUG && logger.log('search', originUrl);

    this.addTab(senderTabId);

    if (!this.urlTabId.has(originUrl)) {
      if (!this.urlPromise.has(originUrl)) {
        const promise = this.createPopupWindow(originUrl).then((tabId) => {
          this.loadingTabIds.push(tabId);
          chrome.tabs.update(tabId, {
            muted: true
          });
          return new Promise((resolve, reject) => {
            chrome.tabs.executeScript(tabId, {
              file: 'tabSearch.js',
              runAt: 'document_start',
            }, (results) => {
              const err = chrome.runtime.lastError;
              err ? reject(err) : resolve(results);
            });
          }).then(() => {
            this.urlTabId.set(originUrl, tabId);
            this.loadingTabIds.splice(this.loadingTabIds.indexOf(tabId), 1);
            return tabId;
          });
        }).then(...promiseFinally(() => {
          this.urlPromise.delete(originUrl);
        }));
        this.urlPromise.set(originUrl, promise);
      }
      await this.urlPromise.get(originUrl);
    }

    const tabId = this.urlTabId.get(originUrl);

    const request = {
      id: ++this.requestId,
      tabId: tabId,
      fired: false,
      done: false,
    };

    this.idRequest.set(request.id, request);

    request.promise = new Promise((resolve, reject) => {
      request.handleResolve = resolve;
      request.handleReject = reject;
    }).then(...promiseFinally(() => {
      this.idRequest.delete(request.id);
      request.done = true;
      this.closeTabIdIdleDebounce();
    }));

    request.init = () => {
      if (request.fired) return request.promise;
      request.fired = true;

      new Promise((resolve, reject) => chrome.tabs.executeScript(tabId, {
        code: `(${function (id, url, options) {
          try {
            window.tabSearch(id, url, options);
            return true;
          } catch (err) {
            logger.error('tabSearch error', err);
          }
        }})(${[request.id, fetchUrl, fetchOptions].map(JSON.stringify).join(',')})`,
        runAt: 'document_start',
      }, (results) => {
        const err = chrome.runtime.lastError;
        err ? reject(err) : resolve(results);
      })).then(results => results[0]).then(result => {
        if (!result) {
          request.handleReject(new ErrorWithCode('tabSearch error', 'TAB_SEARCH_ERROR'));
        }
      });

      return request.promise;
    };

    request.abort = () => {
      new Promise((resolve, reject) => chrome.tabs.executeScript(tabId, {
        code: `(${function (id) {
          try {
            window.tabSearchAbort(id);
          } catch (err) {
            logger.error('tabSearchAbort error', err);
          }
        }})(${[request.id].map(JSON.stringify).join(',')})`,
        runAt: 'document_start',
      }, (results) => {
        const err = chrome.runtime.lastError;
        err ? reject(err) : resolve(results);
      }));
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
  initRequestById(id) {
    DEBUG && logger.log('initRequestById', id);
    const request = this.idRequest.get(id);
    return request.init();
  }
  abortRequestById(id) {
    DEBUG && logger.log('abortRequestById', id);
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
      chrome.tabs.executeScript(tabId, {
        file: 'tabSearch.js',
        runAt: 'document_start',
      }, () => {
        if (!chrome.runtime.lastError) {
          this.idRequest.forEach((request) => {
            if (request.tabId === tabId && !request.done) {
              request.fired = false;
              request.init();
            }
          });
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
  createPopupWindow(url) {
    DEBUG && logger.log('createPopupWindow', url);
    return new Promise(resolve => chrome.windows.create({
      url: url,
      focused: false,
      width: 120,
      height: 60,
      left: screen.availWidth - 120,
      top: screen.availHeight - 60,
      type: 'popup',
    }, resolve)).then((window) => {
      const tabId = window.tabs[0].id;
      return tabId;
    });
  }
  closeTabIdIdleDebounce = debounce(this.closeTabIfIdle.bind(this), 250);
  closeTabIfIdle() {
    DEBUG && logger.log('closeTabIfIdle');
    this.urlTabId.forEach((tabId) => {
      const hasRequest = Array.from(this.idRequest.values()).some((request) => {
        return !request.done && request.tabId === tabId;
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
    this.loadingTabIds.forEach(id => {
      chrome.tabs.remove(id);
    });
    chrome.tabs.onUpdated.removeListener(this.tabUpdatedListener);
    chrome.tabs.onRemoved.removeListener(this.tabRemovedListener);
  }
}

export default Searcher;