import {autorun} from "mobx";
import OptionsStore from "../stores/OptionsStore";
import getLogger from "../tools/getLogger";

const qs = require('querystring');

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