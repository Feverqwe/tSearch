import {autorun} from "mobx";
import OptionsStore from "../stores/OptionsStore";
import getLogger from "../tools/getLogger";
import TrackerStore from "../stores/TrackerStore";
import {fetch} from 'whatwg-fetch'
import getTrackerCodeMeta from "../tools/getTrackerCodeMeta";
import {destroy} from "mobx-state-tree";
import {ErrorWithCode} from "../tools/errors";
import getNow from "../tools/getNow";
import ExplorerModuleStore from "../stores/Explorer/ExplorerModuleStore";
import getExploreModuleCodeMeta from "../tools/getExploreModuleCodeMeta";

const qs = require('querystring');
const compareVersions = require('compare-versions');

const logger = getLogger('background');

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

  chrome.omnibox.onInputEntered.addListener((query) => {
    openSearchPage(query);
  });

  chrome.runtime.onMessage.addListener(function (message, sender, response) {
    if (!message) return;

    let promise = null;
    switch (message.action) {
      case 'updateTracker': {
        promise = updateTracker(message);
        break;
      }
      case 'updateExplorerModule': {
        promise = updateExplorerModule(message);
        break;
      }
    }

    if (promise) {
      promise.then(result => {
        response({result});
      }, err => {
        response({err: {name: err.name, message: err.message, code: message.code, stack: message.stack}});
      });
      return true;
    }
  });
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

const updateTracker = ({id}) => {
  return new Promise(resolve => chrome.storage.local.get({trackers: {}}, resolve)).then(storage => {
    const localTrackerStore = TrackerStore.create(storage.trackers[id]);
    const {downloadURL, version} = localTrackerStore.meta;
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
        options: localTrackerStore.options.toJSON(),
      });
      const tracker = trackerStore.toJSON();
      destroy(trackerStore);

      const isNewVersion = compareVersions(version, tracker.meta.version) > 0;
      if (!isNewVersion) {
        throw new ErrorWithCode('New version is not found', 'NEW_VERSION_IS_NOT_FOUND');
      }

      tracker.options.lastUpdate = getNow();

      return new Promise(resolve => chrome.storage.local.get({trackers: {}}, resolve)).then(storage => {
        storage.trackers[id] = tracker;
        return new Promise(resolve => chrome.storage.local.set(storage, resolve));
      });
    });
  });
};

const updateExplorerModule = ({id}) => {
  return new Promise(resolve => chrome.storage.local.get({explorerModules: {}}, resolve)).then(storage => {
    const localExplorerModuleStore = ExplorerModuleStore.create(storage.explorerModules[id]);
    const {downloadURL, version} = localExplorerModuleStore.meta;
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
        options: localExplorerModuleStore.options.toJSON(),
      });
      const explorerModule = explorerModuleStore.toJSON();
      destroy(explorerModuleStore);

      const isNewVersion = compareVersions(version, explorerModule.meta.version) > 0;
      if (!isNewVersion) {
        throw new ErrorWithCode('New version is not found', 'NEW_VERSION_IS_NOT_FOUND');
      }

      explorerModule.options.lastUpdate = getNow();

      return new Promise(resolve => chrome.storage.local.get({explorerModules: {}}, resolve)).then(storage => {
        storage.explorerModules[id] = explorerModule;
        return new Promise(resolve => chrome.storage.local.set(storage, resolve));
      });
    });
  });
};
