import {autorun} from "mobx";
import OptionsStore from "../stores/OptionsStore";
import getLogger from "../tools/getLogger";
import TrackerStore, {TrackerOptionsStore} from "../stores/TrackerStore";
import {fetch} from 'whatwg-fetch'
import getTrackerCodeMeta from "../tools/getTrackerCodeMeta";
import {destroy} from "mobx-state-tree";
import {ErrorWithCode} from "../tools/errors";
import getNow from "../tools/getNow";
import ExplorerModuleStore from "../stores/Explorer/ExplorerModuleStore";
import getExploreModuleCodeMeta from "../tools/getExploreModuleCodeMeta";
import storageGet from "../tools/storageGet";
import storageSet from "../tools/storageSet";
import promiseFinally from "../tools/promiseFinally";

const promiseLimit = require('promise-limit');
const qs = require('querystring');
const compareVersions = require('compare-versions');
const serializeError = require('serialize-error');
const deserializeError = require('deserialize-error');

const logger = getLogger('background');
const oneLimit = promiseLimit(1);

let searcher = null;

/**@type OptionsStore*/
const optionsStore = OptionsStore.create();

optionsStore.fetchOptions().then(() => {
  let isResetUpdateIcon = false;
  autorun(() => {
    updateIcon(optionsStore.options.invertIcon, isResetUpdateIcon);
    isResetUpdateIcon = true;
  });

  autorun(() => {
    setContextMenu(optionsStore.options.contextMenu);
  });

  let isResetSetPopupMenu = false;
  autorun(() => {
    setPopupMenu(optionsStore.options.disablePopup, isResetSetPopupMenu);
    isResetSetPopupMenu = true;
  });
});

chrome.omnibox.onInputEntered.addListener((query) => {
  openSearchPage(query);
});

chrome.runtime.onMessage.addListener(function (message, sender, response) {
  if (!message) return;

  let promise = null;
  switch (message.action) {
    case 'updateTracker': {
      promise = updateTracker(message.id);
      break;
    }
    case 'updateExplorerModule': {
      promise = updateExplorerModule(message.id);
      break;
    }
    case 'update': {
      promise = update();
      break;
    }
    case 'search': {
      if (!searcher) {
        searcher = new Searcher();
      }
      promise = searcher.search(sender.url, message.origin, message.fetchUrl, message.fetchOptions);
      break;
    }
    case 'initSearch': {
      promise = Promise.resolve().then(() => {
        if (searcher) {
          return searcher.initRequestById(message.id);
        } else {
          throw new Error('Searcher is not exists');
        }
      });
      break;
    }
    case 'abortSearch': {
      if (searcher) {
        searcher.abortRequestById(message.id);
      }
      break;
    }
    case 'searchResponse': {
      if (searcher) {
        searcher.handleResponse(message.id, message.result);
      }
      break;
    }
  }

  if (promise) {
    promise.then(result => {
      response({result});
    }, err => {
      response({error: serializeError(err)});
    });
    return true;
  }
});

const updateIcon = (invertIcon, reset) => {
  if (reset) {
    chrome.browserAction.setIcon({
      path: {
        19: 'assets/icons/icon_19.png',
        38: 'assets/icons/icon_38.png'
      }
    });
  }

  if (invertIcon) {
    chrome.browserAction.setIcon({
      path: {
        19: 'assets/icons/icon_19_i.png',
        38: 'assets/icons/icon_38_i.png'
      }
    });
  }
};

const setContextMenu = (contextMenu) => {
  chrome.contextMenus.onClicked.removeListener(contextMenuClickedListener);
  chrome.contextMenus.removeAll(function () {
    if (contextMenu) {
      chrome.contextMenus.create({
        type: "normal",
        id: "tms",
        title: chrome.i18n.getMessage('contextMenuTitle'),
        contexts: ["selection"]
      });
      chrome.contextMenus.onClicked.addListener(contextMenuClickedListener);
    }
  });
};

const contextMenuClickedListener = (info) => {
  if (info.menuItemId === 'tms') {
    openSearchPage(info.selectionText);
  }
};

const setPopupMenu = (disablePopup, reset) => {
  if (reset) {
    chrome.browserAction.onClicked.removeListener(onBrowserActionClickedListener);
    chrome.browserAction.setPopup({
      popup: 'popup.html'
    });
  }

  if (disablePopup) {
    chrome.browserAction.onClicked.addListener(onBrowserActionClickedListener);
    chrome.browserAction.setPopup({
      popup: ''
    });
  }
};

const onBrowserActionClickedListener = () => {
  chrome.tabs.create({
    url: 'index.html'
  });
};

const openSearchPage = (query) => {
  let url = 'index.html';
  if (query) {
    url += '#/search?' + qs.stringify({
      query: query
    });
  }
  chrome.tabs.create({
    url: url,
    selected: true
  });
};

const update = () => {
  return storageGet({
    trackers: {},
    explorerModules: {},
  }).then(storage => {
    const trackerIds = [];
    Object.entries(storage.trackers).forEach(([id, tracker]) => {
      try {
        const trackerMetaStore = TrackerOptionsStore.create(tracker.options || {});
        if (trackerMetaStore.autoUpdate) {
          trackerIds.push(id);
        }
      } catch (err) {
        logger.error(`Create TrackerMetaStore error`, tracker.id);
      }
    });

    const explorerModuleIds = [];
    Object.entries(storage.explorerModules).forEach(([id, module]) => {
      try {
        const explorerModuleMetaStore = TrackerOptionsStore.create(module.options || {});
        if (explorerModuleMetaStore.autoUpdate) {
          explorerModuleIds.push(id);
        }
      } catch (err) {
        logger.error(`Create ExplorerModuleMetaStore error`, module.id);
      }
    });

    return Promise.all([
      Promise.all(trackerIds.map(id => updateTracker(id).then(result => {
        return {id, result};
      }, err => {
        logger.error(`updateTracker ${id} error`, err);
        return {id, error: serializeError(err)};
      }))),
      Promise.all(explorerModuleIds.map(id => updateExplorerModule(id).then(result => {
        return {id, result};
      }, err => {
        logger.error(`updateExplorerModule ${id} error`, err);
        return {id, error: serializeError(err)};
      })))
    ]).then(([trackers, explorerModules]) => {
      return {trackers, explorerModules};
    });
  });
};

const updateTracker = (id) => {
  return oneLimit(() => {
    return storageGet({trackers: {}}).then(storage => {
      const localTracker = storage.trackers[id];
      const {downloadURL, version} = localTracker.meta;
      if (!downloadURL) {
        throw new ErrorWithCode('downloadURL is empty', 'DOWNLOAD_URL_IS_EMPTY');
      }

      return fetch(downloadURL).then(response => {
        if (!response.ok) {
          throw new ErrorWithCode('bad response', 'BAD_RESPONSE');
        }
        return response.text();
      }).then(code => {
        const trackerStore = TrackerStore.create({
          id: id,
          meta: getTrackerCodeMeta(code),
          code: code,
          options: localTracker.options,
        });
        const tracker = trackerStore.getSnapshot();
        destroy(trackerStore);

        const isNewVersion = compareVersions(tracker.meta.version, version) > 0;
        if (!isNewVersion) {
          throw new ErrorWithCode('New version is not found', 'NEW_VERSION_IS_NOT_FOUND');
        }

        tracker.options.lastUpdate = getNow();

        return storageGet({trackers: {}}).then(storage => {
          storage.trackers[id] = tracker;
          return storageSet(storage);
        });
      });
    }).then(() => true);
  });
};

const updateExplorerModule = (id) => {
  return oneLimit(() => {
    return storageGet({explorerModules: {}}).then(storage => {
      const localModule = storage.explorerModules[id];
      const {downloadURL, version} = localModule.meta;
      if (!downloadURL) {
        throw new ErrorWithCode('downloadURL is empty', 'DOWNLOAD_URL_IS_EMPTY');
      }

      return fetch(downloadURL).then(response => {
        if (!response.ok) {
          throw new ErrorWithCode('bad response', 'BAD_RESPONSE');
        }
        return response.text();
      }).then(code => {
        const explorerModuleStore = ExplorerModuleStore.create({
          id: id,
          meta: getExploreModuleCodeMeta(code),
          code: code,
          options: localModule.options,
        });
        const explorerModule = explorerModuleStore.getSnapshot();
        destroy(explorerModuleStore);

        const isNewVersion = compareVersions(version, explorerModule.meta.version) > 0;
        if (!isNewVersion) {
          throw new ErrorWithCode('New version is not found', 'NEW_VERSION_IS_NOT_FOUND');
        }

        explorerModule.options.lastUpdate = getNow();

        return storageGet({explorerModules: {}}).then(storage => {
          storage.explorerModules[id] = explorerModule;
          return storageSet(storage);
        });
      });
    }).then(() => true);
  });
};

class Searcher {
  constructor() {
    this.tabIds = [];
    this.windowId = null;
    this.urlTabId = new Map();
    this.requestId = 0;
    this.idRequest = new Map();

    const oneLimit = promiseLimit(1);
    this.createTabOneLimit = (url) => {
      return oneLimit(() => this.createTab(url));
    };
  }
  async search(senderUrl, originUrl, fetchUrl, fetchOptions) {
    const tabIds = await this.getUrlTabIds(senderUrl);

    tabIds.forEach(id => this.addTab(id));

    let tabId = this.urlTabId.get(originUrl);
    if (!tabId) {
      tabId = await this.createTabOneLimit(originUrl);
    }

    await new Promise(resolve => chrome.tabs.executeScript(tabId, {
      file: 'tabSearch.js',
    }, resolve));

    const request = {
      id: ++this.requestId,
      tabId: tabId,
      fired: false
    };

    this.idRequest.set(request.id, request);

    request.promise = new Promise((resolve, reject) => {
      request.handleResolve = resolve;
      request.handleReject = reject;
    }).then(...promiseFinally(() => {
      this.idRequest.delete(request.id);
    }));

    request.init = () => {
      if (request.fired) return request.promise;
      request.fired = true;

      new Promise(resolve => chrome.tabs.executeScript(tabId, {
        code: `(${function (id, url, options) {
          try {
            window.tabSearch(id, url, options);
            return true;
          } catch (err) {
            console.error('tabSearch error', err);
          }
        }})(${[request.id, fetchUrl, fetchOptions].map(JSON.stringify).join(',')})`,
      }, resolve)).then(results => results[0]).then(result => {
        if (!result) {
          request.handleReject(new ErrorWithCode('tabSearch error', 'TAB_SEARCH_ERROR'));
        }
      });
      return request.promise;
    };

    request.abort = () => {
      new Promise(resolve => chrome.tabs.executeScript(tabId, {
        code: `(${function (id) {
          try {
            window.tabSearchAbort(id);
          } catch (err) {
            console.error('tabSearchAbort error', err);
          }
        }})(${[request.id].map(JSON.stringify).join(',')})`,
      }, resolve));
    };

    return request.id;
  }
  handleResponse(id, result) {
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
    const request = this.idRequest.get(id);
    return request.init();
  }
  abortRequestById(id) {
    const request = this.idRequest.get(id);
    return request.abort();
  }
  getUrlTabIds(url) {
    return new Promise(resolve => chrome.tabs.query({url: url}, resolve)).then((tabs) => {
      if (!tabs.length) {
        throw new ErrorWithCode('Tab is not found by url', 'TAB_IS_NOT_FOUND');
      }
      return tabs.map(tab => tab.id);
    });
  }
  addTab(id) {
    if (this.tabIds.indexOf(id) === -1) {
      this.tabIds.push(id);
    }
    if (this.tabIds.length === 1) {
      chrome.tabs.onRemoved.addListener(this.tabRemovedListener);
    }
  }
  tabRemovedListener = (tabId) => {
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
  async createTab(url) {
    if (!this.windowId) {
      this.windowId = await this.createWindow();
    }

    const tabId = await new Promise(resolve => chrome.tabs.create({
      windowId: this.windowId,
      url: url,
    }, resolve)).then((tab) => tab.id);

    this.urlTabId.set(url, tabId);

    return tabId;
  }
  createWindow() {
    return new Promise(resolve => chrome.windows.create({
      focused: false,
      state: 'minimized',
    }, resolve)).then((window) => {
      chrome.windows.onRemoved.addListener(this.windowRemovedListener);
      return window.id;
    });
  }
  windowRemovedListener = (windowId) => {
    if (this.windowId === windowId) {
      this.urlTabId.forEach((url, tabId) => {
        this.tabRemovedListener(tabId);
      });
      this.windowId = null;
    }
  };
  async destroy() {
    chrome.windows.onRemoved.removeListener(this.windowRemovedListener);
    chrome.tabs.onRemoved.removeListener(this.tabRemovedListener);
    if (this.windowId) {
      await new Promise(resolve => chrome.windows.remove(this.windowId, resolve));
    }
  }
}