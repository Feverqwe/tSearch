import promiseFinally from "../tools/promiseFinally";
import debounce from "lodash.debounce";
import getLogger from "../tools/getLogger";

const deserializeError = require('deserialize-error');
const Events = require('events');

const logger = getLogger('TabFetchBg');

const DEBUG = false;

class TabFetchBg {
  constructor() {
    this.senderTabMap = new Map();
    this.originTabMap = new Map();
    this.idRequestMap = new Map();
    this.requestIndex = 0;

    this.isMobile = /Mobile Safari\/(\d+)|Android (\d+)/.test(navigator.userAgent);

    DEBUG && logger.debug('constructor');
  }

  async request(senderTabId, originUrl, fetchUrl, fetchOptions) {
    DEBUG && logger.debug('request', senderTabId, originUrl, fetchUrl, fetchOptions);

    const permissions = {
      permissions: ['tabs'],
    };

    const hasPermissions = await containsPermissions(permissions);
    if (!hasPermissions) {
      await requestPermissions(permissions);
    }

    if (!this.senderTabMap.has(senderTabId)) {
      this.senderTabMap.set(senderTabId, new SenderTab(this, senderTabId));
    }
    const senderTab = this.senderTabMap.get(senderTabId);

    if (!this.originTabMap.has(originUrl)) {
      this.originTabMap.set(originUrl, new OriginTab(this, originUrl));
    }
    const originTab = this.originTabMap.get(originUrl);

    const request = new Request(this, originTab, ++this.requestIndex, fetchUrl, fetchOptions);
    this.idRequestMap.set(request.id, request);
    request.on('finish', () => {
      this.idRequestMap.delete(request.id);
    });

    originTab.addRequest(request);
    senderTab.addRequest(request);

    this.addRemovedTabListener();

    return request.id;
  }

  deleteOriginTab(originUrl) {
    this.originTabMap.delete(originUrl);
  }

  addRemovedTabListener() {
    if (!chrome.tabs.onRemoved.hasListener(this.tabRemoveListener)) {
      DEBUG && logger.debug('addRemovedTabListener');
      chrome.tabs.onRemoved.addListener(this.tabRemoveListener);
    }
  }

  removeRemovedTabListener() {
    if (chrome.tabs.onRemoved.hasListener(this.tabRemoveListener)) {
      DEBUG && logger.debug('removeRemovedTabListener');
      chrome.tabs.onRemoved.removeListener(this.tabRemoveListener);
    }
  }

  tabRemoveListener = (tabId) => {
    DEBUG && logger.debug('tabRemoveListener', tabId);
    const senderTab = this.senderTabMap.get(tabId);
    if (senderTab) {
      senderTab.destroy();
      this.senderTabMap.delete(tabId);
    }

    this.originTabMap.forEach((originTab, originUrl) => {
      if (originTab.tabId === tabId) {
        originTab.destroy();
        this.originTabMap.delete(originUrl);
      }
    });

    if (!this.originTabMap.size && !this.idRequestMap.size) {
      this.removeRemovedTabListener();
    }
  };

  initRequest(id) {
    DEBUG && logger.debug('initRequest', id);
    const request = this.idRequestMap.get(id);
    if (request) {
      return request.init();
    } else {
      throw new Error(`initRequest error ${id} is not found`);
    }
  }

  handleResponse(id, result) {
    DEBUG && logger.debug('handleResponse', id);
    const request = this.idRequestMap.get(id);
    if (request) {
      return request.handleResponse(result);
    } else {
      throw new Error(`handleResponse error ${id} is not found`);
    }
  }

  abortRequest(id) {
    DEBUG && logger.debug('abortRequest', id);
    const request = this.idRequestMap.get(id);
    if (request) {
      return request.abort();
    } else {
      throw new Error(`initRequest error ${id} is not found`);
    }
  }

  destroy() {
    DEBUG && logger.debug('destroy');
    this.idRequestMap.forEach((request) => {
      request.destroy();
    });
    this.senderTabMap.clear();
  }
}

class SenderTab {
  constructor(tabFetchBg, tabId) {
    this.tabFetchBg = tabFetchBg;
    this.tabId = tabId;
    this.requests = [];

    DEBUG && logger.debug('SenderTab constructor', this.tabId);
  }

  addRequest(request) {
    DEBUG && logger.debug('SenderTab addRequest', this.tabId, request.id);
    this.requests.push(request);
    request.on('finish', () => {
      const pos = this.requests.indexOf(request);
      if (pos !== -1) {
        this.requests.splice(pos, 1);
      }
    });
  }

  destroy() {
    DEBUG && logger.debug('SenderTab destroy', this.tabId);
    this.requests.slice(0).forEach((requset) => {
      requset.destroy();
    });
  }
}

class OriginTab {
  constructor(tabFetchBg, originUrl) {
    this.tabFetchBg = tabFetchBg;
    this.originUrl = originUrl;
    this.tabId = null;
    this.requests = [];

    this.tabPromise = null;

    DEBUG && logger.debug('OriginTab constructor', this.tabId, this.originUrl);
  }

  addRequest(request) {
    DEBUG && logger.debug('OriginTab addRequest', this.tabId, this.originUrl, request.id);
    this.requests.push(request);
    request.on('finish', () => {
      const pos = this.requests.indexOf(request);
      if (pos !== -1) {
        this.requests.splice(pos, 1);
      }
      if (!this.requests.length) {
        this.closeOnIdleDebounce();
      }
    });
  }

  initTab() {
    DEBUG && logger.debug('OriginTab createTab', this.tabId, this.originUrl);
    if (this.tabPromise) return this.tabPromise;
    return this.tabPromise = Promise.resolve().then(() => {
      if (this.tabFetchBg.isMobile) {
        return createTab(this.originUrl);
      } else {
        return createPopup(this.originUrl);
      }
    }).then((tabId) => {
      this.tabId = tabId;
      this.addTabUpdatedListener();
    });
  }

  addTabUpdatedListener() {
    if (!chrome.tabs.onUpdated.hasListener(this.tabUpdatedListener)) {
      DEBUG && logger.debug('OriginTab addTabUpdatedListener', this.tabId, this.originUrl);
      chrome.tabs.onUpdated.addListener(this.tabUpdatedListener);
    }
  }

  removeTabUpdatedListener() {
    if (chrome.tabs.onUpdated.hasListener(this.tabUpdatedListener)) {
      DEBUG && logger.debug('OriginTab removeTabUpdatedListener', this.tabId, this.originUrl);
      chrome.tabs.onUpdated.removeListener(this.tabUpdatedListener);
    }
  }

  tabUpdatedListener = (tabId, changeInfo) => {
    if (tabId !== this.tabId) return;
    if (!changeInfo.url) return;
    DEBUG && logger.debug('OriginTab tabUpdatedListener', this.tabId, this.originUrl);

    this.requests.forEach((request) => {
      request.initSession();
    });
  };

  closeOnIdleDebounce = debounce(this.closeOnIdle.bind(this), 250);

  closeOnIdle() {
    if (!this.requests.length) {
      DEBUG && logger.debug('OriginTab closeOnIdle', this.tabId, this.originUrl);
      this.tabFetchBg.deleteOriginTab(this.originUrl);
      chrome.tabs.remove(this.tabId);
    }
  }

  destroy() {
    DEBUG && logger.debug('OriginTab destroy', this.tabId, this.originUrl);
    this.requests.slice(0).forEach((request) => {
      request.destroy();
    });
    this.removeTabUpdatedListener();
  }
}

class Request extends Events {
  constructor(tabFetchBg, originTab, id, url, options) {
    super();

    this.tabFetchBg = tabFetchBg;
    this.originTab = originTab;
    this.id = id;
    this.url = url;
    this.options = options;

    this.sessionIndex = 0;

    this.state = 'idle';

    this.handleResolve = null;
    this.handleReject = null;
    this.resultPromise = new Promise((resolve, reject) => {
      this.handleResolve = resolve;
      this.handleReject = reject;
    }).then(...promiseFinally(() => {
      this.state = 'finished';
      this.emit('finish');
    }));

    DEBUG && logger.debug('Request constructor', this.id);
  }

  async init() {
    DEBUG && logger.debug('Request init', this.id);
    if (this.state === 'idle') {
      this.state = 'pending';
      this.initSession();
    }

    return this.resultPromise;
  }

  async initSession() {
    if (this.state === 'finished') return;
    DEBUG && logger.debug('Request initSession', this.id);

    const sessionId = ++this.sessionIndex;

    return this.originTab.initTab().then(() => {
      if (sessionId !== this.sessionIndex) return;

      return executeScriptPromise(this.originTab.tabId, {
        file: 'tabFetch.js',
        runAt: 'document_start',
      });
    }).then(() => {
      if (sessionId !== this.sessionIndex) return;

      return executeScriptPromise(this.originTab.tabId, {
        code: `(${function (id, url, options) {
          try {
            window.tabFetch(id, url, options);
            return {result: true};
          } catch (err) {
            return {error: {message: err.message, stack: err.stack}};
          }
        }})(${strArgs(this.id, this.url, this.options)})`,
        runAt: 'document_start',
      }).then(results => results[0]);
    }).then((result) => {
      if (sessionId !== this.sessionIndex) return;

      if (!result) {
        this.handleReject(new Error('tabFetch error'));
      } else
      if (result.error) {
        this.handleReject(deserializeError(result.error));
      }
    }, (err) => {
      if (sessionId !== this.sessionIndex) return;

      this.handleReject(err);
    });
  }

  handleResponse(result) {
    DEBUG && logger.debug('Request handleResponse', this.id);
    if (result.error) {
      this.handleReject(deserializeError(result.error));
    } else {
      this.handleResolve(result.result);
    }
  }

  abort(reason) {
    DEBUG && logger.debug('Request abort', this.id);
    if (this.state === 'pending') {
      executeScriptPromise(this.originTab.tabId, {
        code: `(${function (id) {
          try {
            window.tabFetchAbort(id);
          } catch (err) {
            logger.error('tabFetchAbort error', err);
          }
        }})(${strArgs(this.id)})`,
        runAt: 'document_start',
      });
    }
    this.handleReject(reason || new Error('Aborted'));
  }

  destroy() {
    DEBUG && logger.debug('Request destroy', this.id);
    this.abort(new Error('Destroyed'));
  }
}

const createPopup = (originUrl) => {
  return new Promise(resolve => chrome.windows.create({
    url: originUrl,
    focused: false,
    width: 120,
    height: 25,
    left: screen.availWidth,
    top: screen.availHeight,
    type: 'popup',
  }, resolve)).then((window) => {
    const tabId = window.tabs[0].id;
    chrome.tabs.update(tabId, {muted: true});
    return tabId;
  });
};

const createTab = (originUrl) => {
  return new Promise(resolve => chrome.tabs.create({
    url: originUrl,
    active: false,
  }, resolve)).then((tab) => {
    const tabId = tab.id;
    chrome.tabs.update(tabId, {muted: true});
    return tabId;
  });
};

const executeScriptPromise = (tabId, options) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.executeScript(tabId, options, (results) => {
      const err = chrome.runtime.lastError;
      err ? reject(err) : resolve(results);
    });
  });
};

const containsPermissions = (permissions) => {
  return new Promise((resolve, reject) => {
    chrome.permissions.contains(permissions, (result) => {
      const err = chrome.runtime.lastError;
      err ? reject(err) : resolve(result);
    });
  });
};

const requestPermissions = (permissions) => {
  return new Promise((resolve, reject) => {
    chrome.permissions.request(permissions, (result) => {
      const err = chrome.runtime.lastError;
      err ? reject(err) : resolve(result);
    });
  }).then((granted) => {
    if (!granted) {
      throw new Error('Permissions is not granted');
    }
  });
};

const strArgs = (...args) => {
  return args.map(JSON.stringify).join(',');
};

export default TabFetchBg;