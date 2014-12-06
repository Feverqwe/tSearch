// ==UserScript==
// @exclude     file://*
// ==/UserScript==

/**
 *
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine.
 *
 **/

var mono = (typeof mono === 'undefined') ? undefined : mono;

(function( window, factory ) {
  if (mono) {
    return;
  }
  if (window) {
    return mono = factory();
  }
  return exports.init = factory;
}(typeof window !== "undefined" ? window : undefined, function ( addon ) {
  var require;

  var mono = {};

  (function() {
    if (typeof window === 'undefined') {
      /**
       * @namespace _require
       */
      require = _require;
      mono.isModule = true;
      mono.isFF = true;
      mono.addon = addon;
      return;
    }

    window.mono = mono;
    if (location.host === 'static.tms.mooo.com') {
      mono.isWebApp = true;
    } else
    if (typeof GM_getValue !== 'undefined') {
      mono.isGM = true;
      if (window.chrome !== undefined) {
        mono.isTM = true;
      }
      return;
    }

    if (window.chrome !== undefined) {
      mono.isChrome = true;
      if (chrome.app.getDetails === undefined) {
        mono.isChromeApp = true;
      } else {
        var details = chrome.app.getDetails();
        if (details && details.app !== undefined) {
          mono.isChromeWebApp = true;
        }
      }
      mono.isChromeInject = chrome.tabs === undefined;
      return;
    }

    if (window.safari !== undefined) {
      mono.isSafari = true;
      mono.isSafariPopup = safari.self.identifier === 'popup';
      mono.isSafariBgPage = safari.self.addEventListener === undefined;
      mono.isSafariInject = !mono.isSafariPopup && safari.application === undefined;
      return;
    }

    if (window.opera !== undefined) {
      mono.isOpera = true;
      mono.isOperaInject = opera.extension.broadcastMessage === undefined;
      return;
    }

    if (window.mx !== undefined) {
      mono.isMaxthon = true;
      return;
    }

    mono.addon = window.addon || window.self;
    if (mono.addon !== undefined && mono.addon.port !== undefined) {
      mono.isFF = true;
    } else
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
      mono.isFF = true;
      mono.noAddon = true;
    } else
    if (navigator.userAgent.indexOf('Safari/') !== -1) {
      mono.isSafari = true;
    }
  })();

  mono.messageStack = 50;

  var msgTools = {
    cbObj: {},
    cbStack: [],
    id: 0,
    idPrefix: Math.floor(Math.random()*1000)+'_',
    addCb: function(message, cb) {
      if (msgTools.cbStack.length > mono.messageStack) {
        delete msgTools.cbObj[msgTools.cbStack.shift()];
      }
      var id = message.callbackId = msgTools.idPrefix+(++msgTools.id);
      msgTools.cbObj[id] = cb;
      msgTools.cbStack.push(id);
    },
    callCb: function(message) {
      var cb = msgTools.cbObj[message.responseId];
      if (cb === undefined) return;
      delete msgTools.cbObj[message.responseId];
      msgTools.cbStack.splice(msgTools.cbStack.indexOf(message.responseId), 1);
      cb(message.data);
    },
    mkResponse: function(response, callbackId, responseMessage) {
      responseMessage = {
        data: responseMessage,
        responseId: callbackId
      };
      response.call(this, responseMessage);
    }
  };

  mono.sendMessage = function(message, cb, hook) {
    message = {
      data: message,
      hook: hook
    };
    if (cb !== undefined) {
      msgTools.addCb(message, cb.bind(this));
    }
    mono.sendMessage.send.call(this, message);
  };

  mono.sendMessageToActiveTab = function(message, cb, hook) {
    message = {
      data: message,
      hook: hook
    };
    if (cb !== undefined) {
      msgTools.addCb(message, cb.bind(this));
    }
    mono.sendMessage.sendToActiveTab.call(this, message);
  };

  mono.sendHook = {};

  mono.onMessage = function(cb) {
    var _this = this;
    mono.onMessage.on.call(_this, function(message, response) {
      if (message.responseId !== undefined) {
        return msgTools.callCb(message);
      }
      var mResponse = msgTools.mkResponse.bind(_this, response, message.callbackId);
      if (mono.sendHook[message.hook] !== undefined) {
        return mono.sendHook[message.hook](message.data, mResponse);
      }
      cb.call(_this, message.data, mResponse);
    });
  };

  mono.storage = undefined;

(function() {
  if (!mono.isChrome) return;

  var chromeMsg = {
    cbList: [],
    mkResponse: function(sender) {
      if (sender.tab) {
        // send to tab
        return function(message) {
          chromeMsg.sendTo(message, sender.tab.id);
        }
      }
      if (sender.monoDirect) {
        return function(message) {
          sender(message, chromeMsg.onMessage);
        };
      }
      return function(message) {
        // send to extension
        chromeMsg.send(message);
      }
    },
    sendTo: function(message, tabId) {
      chrome.tabs.sendMessage(tabId, message);
    },
    onMessage: function(message, sender) {
      if (sender.tab && mono.isChromeBgPage !== 1) {
        return;
      }
      var response = chromeMsg.mkResponse(sender);
      for (var i = 0, cb; cb = chromeMsg.cbList[i]; i++) {
        cb(message, response);
      }
    },
    on: function(cb) {
      chromeMsg.cbList.push(cb);
      if (chromeMsg.cbList.length !== 1) {
        return;
      }
      chrome.runtime.onMessage.addListener(chromeMsg.onMessage);
    },
    sendToActiveTab: function(message) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] === undefined || tabs[0].id < 0) {
          return;
        }
        chromeMsg.sendTo(message, tabs[0].id);
      });
    },
    send: function(message) {
      chrome.runtime.sendMessage(message);
    }
  };

  (function() {
    if (chrome.runtime.getBackgroundPage === undefined) return;

    mono.isChromeBgPage = 1;

    chrome.runtime.getBackgroundPage(function(bgWin) {
      if (bgWin !== window) {
        delete  mono.isChromeBgPage;
      }

      if (!mono.isChromeBgPage) {
        chromeMsg.onMessage.monoDirect = true;
        chromeMsg.send = mono.sendMessage.send = function(message) {
          bgWin.mono.chromeDirectOnMessage(message, chromeMsg.onMessage);
        }
      } else
      if (mono.chromeDirectOnMessage === undefined ) {
        mono.chromeDirectOnMessage = function(message, sender) {
          chromeMsg.onMessage(message, sender);
        };
      }
    });
  })();

  mono.onMessage.on = chromeMsg.on;
  mono.sendMessage.send = chromeMsg.send;
  mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
})();

(function() {
  if (!mono.isFF) return;

  (function() {
    if (!mono.noAddon) return;

    var onCollector = [];
    mono.addon = {
      port: {
        emit: function(pageId, message) {
          var msg = '>'+JSON.stringify(message);
          window.postMessage(msg, "*");
        },
        on: function(pageId, onMessage) {
          onCollector.push(onMessage);
          if (onCollector.length > 1) {
            return;
          }
          window.addEventListener('monoMessage', function (e) {
            if (e.detail[0] !== '<') {
              return;
            }
            var data = e.detail.substr(1);
            var json = JSON.parse(data);
            for (var i = 0, cb; cb = onCollector[i]; i++) {
              cb(json);
            }
          });
        }
      }
    }
  })();

  var firefoxMsg = {
    cbList: [],
    mkResponse: function(pageId) {
      return function(message) {
        firefoxMsg.sendTo(message, pageId);
      }
    },
    on: function(cb) {
      firefoxMsg.cbList.push(cb);
      if (firefoxMsg.cbList.length !== 1) {
        return;
      }
      mono.addon.port.on('mono', function(msg) {
        var response = firefoxMsg.mkResponse(msg.from);
        for (var i = 0, cb; cb = firefoxMsg.cbList[i]; i++) {
          cb(msg, response);
        }
      });
    },
    send: function(message) {
      mono.addon.port.emit('mono', message);
    },
    sendTo: function(message, to) {
      message.to = to;
      mono.addon.port.emit('mono', message);
    },
    sendToActiveTab: function(message) {
      message.hook = 'activeTab';
      firefoxMsg.sendTo(message);
    }
  };

  mono.onMessage.on = firefoxMsg.on;
  mono.sendMessage.send = firefoxMsg.send;
  mono.sendMessage.sendToActiveTab = firefoxMsg.sendToActiveTab;
})();

(function() {
  if (!mono.isSafari) return;

  var safariMsg = {
    cbList: [],
    mkResponse: !mono.isSafariBgPage ? function() {
      return function(message) {
        safariMsg.send(message);
      }
    } : function(source) {
      return function(message) {
        safariMsg.sendTo(message, source);
      }
    },
    sendTo: function(message, source) {
      if (!source.page || !source.page.dispatchMessage) {
        return;
      }
      source.page.dispatchMessage("message", message);
    },
    onMessage: function(event) {
      var message = event.message;
      var response = safariMsg.mkResponse(event.target);
      for (var i = 0, cb; cb = safariMsg.cbList[i]; i++) {
        cb(message, response);
      }
    },
    on: function(cb) {
      safariMsg.cbList.push(cb);
      if (safariMsg.cbList.length !== 1) {
        return;
      }
      if ( (mono.isSafariPopup || mono.isSafariBgPage) && mono.safariDirectOnMessage === undefined ) {
        mono.safariDirectOnMessage = safariMsg.onMessage;
      }
      if (mono.isSafariBgPage) {
        return safari.application.addEventListener("message", safariMsg.onMessage, false);
      }
      safari.self.addEventListener("message", safariMsg.onMessage, false);
    },
    sendToActiveTab: function(message) {
      var currentTab = safari.application.activeBrowserWindow.activeTab;
      safariMsg.sendTo(message, currentTab);
    },
    send: mono.isSafariPopup ? function(message) {
      safari.extension.globalPage.contentWindow.mono.safariDirectOnMessage({
        message: message,
        target: {
          page: {
            dispatchMessage: function(name, message) {
              mono.safariDirectOnMessage({message: message});
            }
          }
        }
      });
    } : mono.isSafariBgPage ? function(message) {
      for (var w = 0, window; window = safari.application.browserWindows[w]; w++) {
        for (var t = 0, tab; tab = window.tabs[t]; t++) {
          safariMsg.sendTo(message, tab);
        }
      }
    } : function(message) {
      safariMsg.sendTo(message, {page: safari.self.tab});
    }
  };

  mono.onMessage.on = safariMsg.on;
  mono.sendMessage.send = safariMsg.send;
  mono.sendMessage.sendToActiveTab = safariMsg.sendToActiveTab;
})();

(function() {
  if (!mono.isOpera) return;

  var operaMsg = {
    cbList: [],
    mkResponse: function(source) {
      return function(message) {
        operaMsg.sendTo(message, source);
      }
    },
    sendTo: function(message, source) {
      try {
        source.postMessage(message);
      } catch (e) {}
    },
    on: function(cb) {
      operaMsg.cbList.push(cb);
      if (operaMsg.cbList.length !== 1) {
        return;
      }
      opera.extension.onmessage = function(event) {
        var message = event.data;
        var response = operaMsg.mkResponse(event.source);
        for (var i = 0, cb; cb = operaMsg.cbList[i]; i++) {
          cb(message, response);
        }
      }
    },
    sendToActiveTab: function(message) {
      var currentTab = opera.extension.tabs.getSelected();
      operaMsg.sendTo(message, currentTab);
    },
    send: mono.isOperaInject ? function(message) {
      operaMsg.sendTo(message, opera.extension);
    } : function(message) {
      opera.extension.broadcastMessage(message);
    }
  };

  mono.onMessage.on = operaMsg.on;
  mono.sendMessage.send = operaMsg.send;
  mono.sendMessage.sendToActiveTab = operaMsg.sendToActiveTab;
})();

(function() {
  if (!mono.isGM) return;

  var gmMsg = {
    cbList: [],
    onMessage: function(message) {
      var response = gmMsg.onMessage;
      for (var i = 0, cb; cb = gmMsg.cbList[i]; i++) {
        if (this.isBg === cb.isBg) {
          continue;
        }
        cb(message, response.bind({isBg: cb.isBg}));
      }
    },
    on: function(cb) {
      cb.isBg = this.isBg;
      gmMsg.cbList.push(cb);
    }
  };
  gmMsg.send = gmMsg.onMessage;

  mono.onMessage.on = gmMsg.on;
  mono.sendMessage.send = gmMsg.send;
  mono.sendMessage.sendToActiveTab = gmMsg.send;
})();

(function() {
  if (!mono.isChrome || !chrome.storage) return;

  var chStorage = function(mode) {
    return chrome.storage[mode];
  };

  mono.storage = chStorage('local');
  mono.storage.local = mono.storage;
  mono.storage.sync = chStorage('sync');
})();

(function() {
  if (!mono.isFF || !mono.isModule) return;

  var ffSimpleStorage = function() {
    var ss = require('sdk/simple-storage');
    return {
      get: function (src, cb) {
        var key, obj = {};
        if (src === undefined || src === null) {
          for (key in ss.storage) {
            if (!ss.storage.hasOwnProperty(key)) {
              continue;
            }
            obj[key] = ss.storage[key];
          }
          return cb(obj);
        }
        if (typeof src === 'string') {
          src = [src];
        }
        if (Array.isArray(src) === true) {
          for (var i = 0, len = src.length; i < len; i++) {
            key = src[i];
            obj[key] = ss.storage[key];
          }
        } else {
          for (key in src) {
            obj[key] = ss.storage[key];
          }
        }
        cb(obj);
      },
      set: function (obj, cb) {
        for (var key in obj) {
          ss.storage[key] = obj[key];
        }
        cb && cb();
      },
      remove: function (obj, cb) {
        if (Array.isArray(obj)) {
          for (var i = 0, len = obj.length; i < len; i++) {
            var key = obj[i];
            delete ss.storage[key];
          }
        } else {
          delete ss.storage[obj];
        }
        cb && cb();
      },
      clear: function (cb) {
        for (var key in ss.storage) {
          delete ss.storage[key];
        }
        cb && cb();
      }
    }
  };

  mono.storage = ffSimpleStorage();
  mono.storage.local = mono.storage.sync = mono.storage;
})();

(function() {
  if (!mono.isGM) return;

  var storage = {
    /**
     * @namespace GM_listValues
     * @namespace GM_getValue
     * @namespace GM_setValue
     * @namespace GM_deleteValue
     */
    get: function (src, cb) {
      var key, obj = {};
      if (src === undefined || src === null) {
        var nameList = GM_listValues();
        for (key in nameList) {
          obj[key] = GM_getValue(key);
        }
        return cb(obj);
      }
      if (typeof src === 'string') {
        src = [src];
      }
      if (Array.isArray(src) === true) {
        for (var i = 0, len = src.length; i < len; i++) {
          key = src[i];
          obj[key] = GM_getValue(key);
        }
      } else {
        for (key in src) {
          obj[key] = GM_getValue(key);
        }
      }
      cb(obj);
    },
    set: function (obj, cb) {
      for (var key in obj) {
        GM_setValue(key, obj[key]);
      }
      cb && cb();
    },
    remove: function (obj, cb) {
      if (Array.isArray(obj)) {
        for (var i = 0, len = obj.length; i < len; i++) {
          var key = obj[i];
          GM_deleteValue(key);
        }
      } else {
        GM_deleteValue(obj);
      }
      cb && cb();
    },
    clear: function (cb) {
      var nameList = GM_listValues();
      for (var key in nameList) {
        GM_deleteValue(key);
      }
      cb && cb();
    }
  };

  mono.storage = storage;
  mono.storage.local = mono.storage.sync = mono.storage;
})();

(function() {
  if (mono.storage) return;

  var getLocalStorage = function(localStorage) {
    var localStorageMode = {
      getObj: function(key) {
        var index = 0;
        var keyPrefix = localStorageMode.chunkPrefix + key;
        var chunk = localStorage[keyPrefix + index];
        var data = '';
        while (chunk !== undefined) {
          data += chunk;
          index++;
          chunk = localStorage[keyPrefix + index];
        }
        var value = undefined;
        try {
          value = JSON.parse(data);
        } catch (e) {
        }
        return value;
      },
      setObj: function(key, value) {
        value = JSON.stringify(value);
        var keyPrefix = localStorageMode.chunkPrefix + key;
        var chunkLen = 1024 - keyPrefix.length - 3;
        if (localStorageMode.regexp === undefined) {
          localStorageMode.regexp = new RegExp('.{1,' + chunkLen + '}', 'g');
        }
        var valueLen = value.length;
        var number_of_part = Math.floor(valueLen / chunkLen);
        if (number_of_part >= 512) {
          console.log('monoLog:', 'localStorage', 'Can\'t save item', key, ', very big!');
          return;
        }
        var dataList = value.match(localStorageMode.regexp);
        var dataListLen = dataList.length;
        for (var i = 0, item; i < dataListLen; i++) {
          item = dataList[i];
          localStorage[keyPrefix + i] = item;
        }
        localStorage[key] = localStorageMode.chunkItem;

        localStorageMode.rmObj(key, dataListLen);
      },
      rmObj: function(key, index) {
        var keyPrefix = localStorageMode.chunkPrefix + key;
        if (index === undefined) {
          index = 0;
        }
        var data = localStorage[keyPrefix + index];
        while (data !== undefined) {
          delete localStorage[keyPrefix + index];
          index++;
          data = localStorage[keyPrefix + index];
        }
      },
      readValue: function(key, value) {
        if (value === localStorageMode.chunkItem) {
          value = localStorageMode.getObj(key)
        } else if (value !== undefined) {
          var data = value.substr(1);
          var type = value[0];
          if (type === 'i') {
            value = parseInt(data);
          } else if (type === 'b') {
            value = data === 'true';
          } else {
            value = data;
          }
        }
        return value;
      },
      get: function(src, cb) {
        var key, obj = {};
        if (src === undefined || src === null) {
          for (key in localStorage) {
            if (!localStorage.hasOwnProperty(key) || key === 'length') {
              continue;
            }
            if (key.substr(0, localStorageMode.chunkLen) === localStorageMode.chunkPrefix) {
              continue;
            }
            obj[key] = localStorageMode.readValue(key, localStorage[key]);
          }
          return cb(obj);
        }
        if (typeof src === 'string') {
          src = [src];
        }
        if (Array.isArray(src) === true) {
          for (var i = 0, len = src.length; i < len; i++) {
            key = src[i];
            obj[key] = localStorageMode.readValue(key, localStorage[key]);
          }
        } else {
          for (key in src) {
            obj[key] = localStorageMode.readValue(key, localStorage[key]);
          }
        }
        cb(obj);
      },
      set: function(obj, cb) {
        var key;
        for (key in obj) {
          var value = obj[key];
          if (value === undefined) {
            localStorageMode.remove(key);
          } else if (typeof value === 'object') {
            localStorageMode.setObj(key, value);
          } else {
            var type = typeof value;
            if (type === 'boolean') {
              value = 'b' + value;
            } else if (type === 'number') {
              value = 'i' + value;
            } else {
              value = 's' + value;
            }
            localStorage[key] = value;
          }
        }
        cb && cb();
      },
      remove: function(obj, cb) {
        if (Array.isArray(obj)) {
          for (var i = 0, len = obj.length; i < len; i++) {
            var key = obj[i];
            if (localStorage[key] === localStorageMode.chunkItem) {
              localStorageMode.rmObj(key);
            }
            delete localStorage[key];
          }
        } else {
          if (localStorage[obj] === localStorageMode.chunkItem) {
            localStorageMode.rmObj(obj);
          }
          delete localStorage[obj];
        }
        cb && cb();
      },
      clear: function(cb) {
        localStorage.clear();
        cb && cb();
      }
    };
    localStorageMode.chunkPrefix = 'mCh_';
    localStorageMode.chunkLen = localStorageMode.chunkPrefix.length;
    localStorageMode.chunkItem = 'monoChunk';
    return localStorageMode;
  };

  var externalStorage = {
    get: function(obj, cb) {
      mono.sendMessage({action: 'get', data: obj}, cb, 'monoStorage');
    },
    set: function(obj, cb) {
      mono.sendMessage({action: 'set', data: obj}, cb, 'monoStorage');
    },
    remove: function(obj, cb) {
      mono.sendMessage({action: 'remove', data: obj}, cb, 'monoStorage');
    },
    clear: function(cb) {
      mono.sendMessage({action: 'clear'}, cb, 'monoStorage');
    }
  };

  var externalStorageHook = function(message, response) {
    if (message.action === 'get') {
      return mono.storage.get(message.data, response);
    } else
    if (message.action === 'set') {
      return mono.storage.set(message.data, response);
    } else
    if (message.action === 'remove') {
      return mono.storage.remove(message.data, response);
    } else
    if (message.action === 'clear') {
      return mono.storage.clear(response);
    }
  };

  if (false && mono.isOpera && window.widget) {
    // remove false if need use prefs
    mono.storage = getLocalStorage(window.widget.preferences);
    mono.storage.local = mono.storage.sync = mono.storage;
    return;
  }
  if (mono.isFF || mono.isChromeInject || mono.isOperaInject || mono.isSafariInject) {
    mono.storage = externalStorage;
    mono.storage.local = mono.storage.sync = mono.storage;
    return;
  }
  if (window.localStorage) {
    mono.storage = getLocalStorage(window.localStorage);
    mono.storage.local = mono.storage.sync = mono.storage;
    if (mono.isChrome || mono.isSafari || mono.isOpera) {
      // ff work via monoLib.js
      mono.sendHook.monoStorage = externalStorageHook;
    }
    return;
  }
  console.error('Can\'t detect storage!');
})();

//> utils
  mono.loadLanguage = function(cb, force) {
    var language = {};
    var url = '_locales/{lang}/messages.json';
    if (mono.isOpera && !mono.isOperaInject) {
      url = 'build/' + url;
    }
    if (mono.isModule) {
      var window = require('sdk/window/utils').getMostRecentBrowserWindow();
      var self = require('sdk/self');
    }
    var lang, data;
    if (mono.isChrome) {
      lang = chrome.i18n.getMessage('lang');
    } else {
      lang = ((typeof navigator !== 'undefined') ? navigator : window.navigator).language.substr(0, 2);
    }
    if (['ru', 'en'].indexOf(lang) === -1) {
      lang = 'en';
    }

    url = url.replace('{lang}', force || lang);
    if (mono.isModule) {
      try {
        data = JSON.parse(self.data.load(url));
      } catch (e) {
        if (force) {
          return cb();
        }
        return mono.loadLanguage(cb, 'en');
      }
      for (var item in data) {
        language[item] = data[item].message;
      }
      return cb(language);
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var data = xhr.response;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      for (var item in data) {
        language[item] = data[item].message;
      }
      cb(language);
    };
    xhr.onerror = function() {
      if (force) {
        return cb();
      }
      mono.loadLanguage(cb, 'en');
    };
    try {
      xhr.send();
    } catch (e) {
      xhr.onerror();
    }
  };
  //<utils

  return mono;
}));