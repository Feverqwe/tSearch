var mono = (typeof mono !== 'undefined') ? mono : undefined;

(function(base, factory) {
  "use strict";
  if (mono && mono.isLoaded) {
    return;
  }

  var _mono = mono;
  var fn = function(addon) {
    return factory(_mono, addon);
  };

  if (typeof window !== "undefined") {
    mono = base(fn);
    return;
  }
}(function base(factory) {
  if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
    return factory();
  }

  var base = Object.create({
    isLoaded: true,
    onReadyStack: [],
    onReady: function() {
      base.onReadyStack.push([this, arguments]);
    }
  });

  var onLoad = function() {
    document.removeEventListener('DOMContentLoaded', onLoad, false);
    window.removeEventListener('load', onLoad, false);

    mono = factory();

    for (var key in base) {
      if (base.hasOwnProperty(key)) {
        mono[key] = base[key];
      }
    }

    var item;
    while (item = base.onReadyStack.shift()) {
      mono.onReady.apply(item[0], item[1]);
    }
  };

  document.addEventListener('DOMContentLoaded', onLoad, false);
  window.addEventListener('load', onLoad, false);

  return base;
}, function initMono(_mono, _addon) {
  "use strict";
  var browserApi = function() {
    "use strict";
    var isInject = location.protocol !== 'chrome-extension:';
    var isBgPage = !isInject && location.pathname.indexOf('_generated_background_page.html') !== -1;

    var emptyFn = function() {};

    /**
     * @param {Function} fn
     * @returns {Function}
     */
    var onceFn = function(fn) {
      return function(msg) {
        if (fn) {
          fn(msg);
          fn = null;
        }
      };
    };

    /**
     * @returns {Number}
     */
    var getTime = function() {
      return parseInt(Date.now() / 1000);
    };

    var msgTools = {
      id: 0,
      idPrefix: Math.floor(Math.random() * 1000),
      /**
       * @returns {String}
       */
      getId: function() {
        return this.idPrefix + '_' + (++this.id);
      },
      /**
       * @typedef {Object} Sender
       * @property {Object} [tab]
       * @property {number} tab.callbackId
       * @property {number} [frameId]
       */
      /**
       * @param {string} id
       * @param {Sender} sender
       * @returns {Function}
       */
      asyncSendResponse: function(id, sender) {
        return function(message) {
          message.responseId = id;

          if (sender.tab && sender.tab.id >= 0) {
            if (sender.frameId !== undefined) {
              chrome.tabs.sendMessage(sender.tab.id, message, {
                frameId: sender.frameId
              });
            } else {
              chrome.tabs.sendMessage(sender.tab.id, message);
            }
          } else {
            chrome.runtime.sendMessage(message);
          }
        };
      },
      listenerList: [],
      /**
       * @typedef {Object} MonoMsg
       * @property {boolean} mono
       * @property {string} [hook]
       * @property {string} idPrefix
       * @property {string} [callbackId]
       * @property {boolean} [async]
       * @property {boolean} isBgPage
       * @property {string} [responseId]
       * @property {boolean} hasCallback
       * @property {*} data
       */
      /**
       * @param {MonoMsg} message
       * @param {Sender} sender
       * @param {Function} _sendResponse
       */
      listener: function(message, sender, _sendResponse) {
        var _this = msgTools;
        var sendResponse = null;
        if (message && message.mono && !message.responseId && message.idPrefix !== _this.idPrefix && message.isBgPage !== isBgPage) {
          if (!message.hasCallback) {
            sendResponse = emptyFn;
          } else {
            sendResponse = _this.asyncSendResponse(message.callbackId, sender);
          }

          var responseFn = onceFn(function(msg) {
            var message = _this.wrap(msg);
            sendResponse(message);
            sendResponse = null;
          });

          _this.listenerList.forEach(function(fn) {
            if (message.hook === fn.hook) {
              fn(message.data, responseFn);
            }
          });
        }
      },
      async: {},
      /**
       *
       * @param {MonoMsg} message
       * @param {Sender} sender
       * @param {Function} sendResponse
       */
      asyncListener: function(message, sender, sendResponse) {
        var _this = msgTools;
        if (message && message.mono && message.responseId && message.idPrefix !== _this.idPrefix && message.isBgPage !== isBgPage) {
          var item = _this.async[message.responseId];
          var fn = item && item.fn;
          if (fn) {
            delete _this.async[message.responseId];
            if (!Object.keys(_this.async).length) {
              chrome.runtime.onMessage.removeListener(_this.asyncListener);
            }

            fn(message.data);
          }
        }

        _this.gc();
      },
      /**
       * @param {*} [msg]
       * @returns {MonoMsg}
       */
      wrap: function(msg) {
        return {
          mono: true,
          data: msg,
          idPrefix: this.idPrefix,
          isBgPage: isBgPage
        };
      },
      /**
       * @param {string} id
       * @param {Function} responseCallback
       */
      wait: function(id, responseCallback) {
        this.async[id] = {
          fn: responseCallback,
          time: getTime()
        };

        if (!chrome.runtime.onMessage.hasListener(this.asyncListener)) {
          chrome.runtime.onMessage.addListener(this.asyncListener);
        }

        this.gc();
      },
      gcTimeout: 0,
      gc: function() {
        var now = getTime();
        if (this.gcTimeout < now) {
          var expire = 180;
          var async = this.async;
          this.gcTimeout = now + expire;
          Object.keys(async).forEach(function(responseId) {
            if (async [responseId].time + expire < now) {
              delete async [responseId];
            }
          });

          if (!Object.keys(async).length) {
            chrome.runtime.onMessage.removeListener(this.asyncListener);
          }
        }
      }
    };

    var api = {
      isChrome: true,
      /**
       * @param {*} msg
       * @param {Function} [responseCallback]
       */
      sendMessageToActiveTab: function(msg, responseCallback) {
        var message = msgTools.wrap(msg);

        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function(tabs) {
          var tabId = tabs[0] && tabs[0].id;
          if (tabId >= 0) {
            var hasCallback = !!responseCallback;
            message.hasCallback = hasCallback;
            if (hasCallback) {
              message.callbackId = msgTools.getId();
              msgTools.wait(message.callbackId, responseCallback);
            }

            chrome.tabs.sendMessage(tabId, message, emptyFn);
          }
        });
      },
      /**
       * @param {*} msg
       * @param {Function} [responseCallback]
       * @param {String} [hook]
       */
      sendMessage: function(msg, responseCallback, hook) {
        var message = msgTools.wrap(msg);
        hook && (message.hook = hook);

        var hasCallback = !!responseCallback;
        message.hasCallback = hasCallback;
        if (hasCallback) {
          message.callbackId = msgTools.getId();
          msgTools.wait(message.callbackId, responseCallback);
        }

        chrome.runtime.sendMessage(message, emptyFn);
      },
      onMessage: {
        /**
         * @param {Function} callback
         * @param {Object} [details]
         */
        addListener: function(callback, details) {
          details = details || {};
          details.hook && (callback.hook = details.hook);

          if (msgTools.listenerList.indexOf(callback) === -1) {
            msgTools.listenerList.push(callback);
          }

          if (!chrome.runtime.onMessage.hasListener(msgTools.listener)) {
            chrome.runtime.onMessage.addListener(msgTools.listener);
          }
        },
        /**
         * @param {Function} callback
         */
        removeListener: function(callback) {
          var pos = msgTools.listenerList.indexOf(callback);
          if (pos !== -1) {
            msgTools.listenerList.splice(pos, 1);
          }

          if (!msgTools.listenerList.length) {
            chrome.runtime.onMessage.removeListener(msgTools.listener);
          }
        }
      }
    };

    var initChromeStorage = function(type) {
      type = type || 'local';
      // firefox don't support sync
      if (type === 'sync' && !chrome.storage[type]) {
        type = 'local';
      }
      return {
        /**
         * @param {String|[String]|Object|null|undefined} [keys]
         * @param {Function} callback
         */
        get: function(keys, callback) {
          chrome.storage[type].get(keys, callback);
        },
        /**
         * @param {Object} items
         * @param {Function} [callback]
         */
        set: function(items, callback) {
          chrome.storage[type].set(items, callback);
        },
        /**
         * @param {String|[String]} [keys]
         * @param {Function} [callback]
         */
        remove: function(keys, callback) {
          chrome.storage[type].remove(keys, callback);
        },
        /**
         * @param {Function} [callback]
         */
        clear: function(callback) {
          chrome.storage[type].clear(callback);
        }
      };
    };

    api.storage = initChromeStorage();
    api.storage.sync = initChromeStorage('sync');

    /**
     * @param {Function} cb
     * @param {number} [delay]
     * @returns {number}
     */
    api.setTimeout = function (cb, delay) {
      return setTimeout(cb, delay);
    };

    /**
     * @param {number} timeout
     */
    api.clearTimeout = function(timeout) {
      return clearTimeout(timeout);
    };

    /**
     * @param {Function} cb
     * @param {number} [delay]
     * @returns {number}
     */
    api.setInterval = function(cb, delay) {
      "use strict";
      return setInterval(cb, delay);
    };

    /**
     * @param {number} timeout
     */
    api.clearInterval = function(timeout) {
      "use strict";
      return clearInterval(timeout);
    };

    /**
     * @param {String} locale
     * @param {Function} cb
     */
    api.getLanguage = function (locale, cb) {
      var convert = function(messages) {
        var language = {};
        for (var key in messages) {
          if (messages.hasOwnProperty(key)) {
            language[key] = messages[key].message;
          }
        }
        return language;
      };

      var url = '_locales/{locale}/messages.json';

      var xhr = new XMLHttpRequest();
      try {
        xhr.open('GET', url.replace('{locale}', locale));
      } catch (e) {
        return cb(e);
      }
      xhr.onload = function () {
        var err = null;
        var obj = null;
        try {
          obj = convert(JSON.parse(xhr.responseText));
        } catch (e) {
          err = e;
        }
        return cb(err, obj);
      };
      xhr.onerror = function () {
        return cb(new Error(xhr.status + ' ' + xhr.statusText));
      };
      xhr.send();
    };

    api.getLoadedLocale = function () {
      return chrome.i18n.getUILanguage();
    };

    api.createBlob = function (byteArrays, details) {
      return new Blob(byteArrays, details);
    };

    api.btoa = function (data) {
      return btoa(data);
    };

    api.atob = function (b64) {
      return atob(b64);
    };

    api.urlRevokeObjectURL = function (url) {
      return URL.revokeObjectURL(url);
    };

    api.urlCreateObjectURL = function (url) {
      return URL.createObjectURL(url);
    };

    api.getFileReader = function () {
      return new FileReader();
    };

    api.prompt = function (message, def) {
      return prompt(message, def);
    };

    var notificationIdList = {};
    api.showNotification = function(icon, title, desc, details) {
      details = details || {};
      var id = details.id;
      var timeout = details.notificationTimeout;

      var notifyId = 'notify';
      if (id !== undefined) {
        notifyId += id;
      } else {
        notifyId += Date.now();
      }
      var timerId = notifyId + 'Timer';

      if (id !== undefined && notificationIdList[notifyId] !== undefined) {
        clearTimeout(notificationIdList[timerId]);
        delete notificationIdList[notifyId];
        chrome.notifications.clear(notifyId, function(){});
      }
      /**
       * @namespace chrome.notifications
       */
      chrome.notifications.create(
          notifyId,
          {
            type: 'basic',
            iconUrl: icon,
            title: String(title),
            message: String(desc)
          },
          function(id) {
            notificationIdList[notifyId] = id;
          }
      );
      if (timeout > 0) {
        notificationIdList[timerId] = mono.setTimeout(function () {
          notificationIdList[notifyId] = undefined;
          chrome.notifications.clear(notifyId, function(){});
        }, timeout);
      }
    };

    api.addInClipboard = function (text) {
      var textArea = document.createElement('textarea');
      textArea.textContent = text;
      document.body.appendChild(textArea);
      textArea.select();
      mono.setTimeout(function() {
        document.execCommand("copy", false, null);
        textArea.parentNode.removeChild(textArea);
      });
    };

    api.setBadgeText = function (text) {
      chrome.browserAction.setBadgeText({
        text: text
      });
    };

    api.setBadgeBackgroundColor = function (color) {
      var chColor = color.split(',').map(function(i){return parseFloat(i);});
      if (chColor.length === 4) {
        chColor.push(parseInt(255 * chColor.splice(-1)[0]));
      }
      chrome.browserAction.setBadgeBackgroundColor({
        color: chColor
      });
    };

    api.openTab = function (url) {
      chrome.tabs.create({url: url});
    };

    api.isTab = function () {
      return !chrome.extension.getViews({
        type: 'popup'
      }).some(function (_window) {
        return window === _window;
      });
    };

    /**
     * @param {Function} [callback]
     */
    api.contextMenusRemoveAll = function (callback) {
      chrome.contextMenus.removeAll(callback);
    };

    /**
     * @param {Object} [createProperties]
     * @param {String} [createProperties.id]
     * @param {String} [createProperties.parentId]
     * @param {Array} [createProperties.contexts]
     * @param {Function} [createProperties.onclick]
     * @param {Function} [callback]
     */
    api.contextMenusCreate = function (createProperties, callback) {
      chrome.contextMenus.create(createProperties, callback);
    };

    var _navigator = null;
    /**
     * @returns {{language: String, platform: String, userAgent: String}}
     */
    api.getNavigator = function () {
      if (_navigator) {
        return _navigator;
      }

      _navigator = {};
      ['language', 'platform', 'userAgent'].forEach(function(key) {
        _navigator[key] = navigator[key] || '';
      });

      return _navigator;
    };

    return {
      api: api
    };
  };

  var mono = browserApi(_addon).api;
  mono.isLoaded = true;
  mono.onReady = function(cb) {
    return cb();
  };

  mono.param = function(params) {
    if (typeof params === 'string') return params;

    var args = [];
    for (var key in params) {
      var value = params[key];
      if (value === null || value === undefined) {
        continue;
      }
      args.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
    return args.join('&');
  };
  mono.ajax = function(obj) {
    var url = obj.url;

    var method = obj.type || 'GET';
    method = method.toUpperCase();

    var data = obj.data;

    if (data && typeof data !== "string") {
      data = mono.param(data);
    }

    if (data && method === 'GET') {
      url += (url.indexOf('?') === -1 ? '?' : '&') + data;
      data = undefined;
    }

    if (obj.cache === false && ['GET','HEAD'].indexOf(method) !== -1) {
      var nc = '_=' + Date.now();
      url += (url.indexOf('?') === -1 ? '?' : '&') + nc;
    }

    if (obj.changeUrl) {
      url = obj.changeUrl(url, method);
    }

    var xhr = new XMLHttpRequest();

    xhr.open(method, url, true);

    if (obj.timeout !== undefined) {
      xhr.timeout = obj.timeout;
    }

    if (obj.dataType) {
      obj.dataType = obj.dataType.toLowerCase();

      xhr.responseType = obj.dataType;
    }

    obj.headers = obj.headers || {};

    if (obj.contentType) {
      obj.headers["Content-Type"] = obj.contentType;
    }

    if (data && !obj.headers["Content-Type"]) {
      obj.headers["Content-Type"] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    if (obj.mimeType) {
      xhr.overrideMimeType(obj.mimeType);
    }

    for (var key in obj.headers) {
      xhr.setRequestHeader(key, obj.headers[key]);
    }

    if (obj.timeout !== undefined) {
      xhr.ontimeout = function() {
        obj.timeout(xhr);
      }
    }

    if (obj.abort !== undefined) {
      xhr.onabort = function() {
        obj.abort(xhr);
      }
    }

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 0) {
        var response = (obj.dataType) ? xhr.response : xhr.responseText;

        return obj.success && obj.success(response, xhr);
      }
      obj.error && obj.error(xhr);
    };

    xhr.onerror = function() {
      obj.error && obj.error(xhr);
    };

    xhr.send(data);

    return xhr;
  };
  /**
   * @param {object} obj
   * @returns {boolean}
   */
  mono.isEmptyObject = function(obj) {
    "use strict";
    for (var item in obj) {
      return false;
    }
    return true;
  };
  /**
   * Create new element
   * @param {Element|Node|String} tagName
   * @param {Object} [obj]
   * @returns {Element|Node}
   */
  mono.create = function (tagName, obj) {
    var el;
    var func;
    if (typeof tagName !== 'object') {
      el = document.createElement(tagName);
    } else {
      el = tagName;
    }
    for (var attr in obj) {
      var value = obj[attr];
      if (func = mono.create.hook[attr]) {
        func(el, value);
        continue;
      }
      el[attr] = value;
    }
    return el;
  };
  mono.create.hook = {
    text: function (el, value) {
      el.textContent = value;
    },
    data: function (el, value) {
      for (var item in value) {
        if (value[item] === undefined || value[item] === null) {
          continue;
        }
        el.dataset[item] = value[item];
      }
    },
    class: function (el, value) {
      if (Array.isArray(value)) {
        for (var i = 0, len = value.length; i < len; i++) {
          var className = value[i];
          if (className === null || className === undefined) {
            continue;
          }
          el.classList.add(className);
        }
      } else {
        el.setAttribute('class', value);
      }
    },
    style: function (el, value) {
      if (typeof value === 'object') {
        for (var item in value) {
          el.style[item] = value[item];
        }
      } else {
        el.setAttribute('style', value);
      }
    },
    append: function (el, value) {
      if (!Array.isArray(value)) {
        value = [value];
      }
      for (var i = 0, len = value.length; i < len; i++) {
        var node = value[i];
        if (!node && node !== 0) {
          continue;
        }
        if (typeof node !== 'object') {
          node = document.createTextNode(node);
        }
        el.appendChild(node);
      }
    },
    after: function(el, value) {
      "use strict";
      var hasNextEl = el.nextElementSibling;
      var elList = document.createDocumentFragment();
      mono.create.hook.append(elList, value);
      if (hasNextEl !== null) {
        el.parentNode.insertBefore(elList, hasNextEl);
      } else {
        el.parentNode.appendChild(elList);
      }
    },
    on: function (el, eventList) {
      if (typeof eventList[0] !== 'object') {
        eventList = [eventList];
      }
      for (var i = 0, len = eventList.length; i < len; i++) {
        var args = eventList[i];
        if (!Array.isArray(args)) {
          continue;
        }
        el.addEventListener(args[0], args[1], args[2]);
      }
    },
    onCreate: function (el, value) {
      value.call(el, el);
    }
  };
  /**
   * @param {String|Array} list
   * @param {DocumentFragment} [fragment]
   * @returns {DocumentFragment|Element}
   */
  mono.parseTemplate = function(list, fragment) {
    "use strict";
    if (typeof list === "string") {
      list = list.replace(/"/g, '\\"').replace(/\\'/g, '\\u0027').replace(/'/g, '"').replace(/([{,]{1})\s*([a-zA-Z0-9]+):/g, '$1"$2":');
      try {
        list = JSON.parse(list);
      } catch (e) {
        return document.createTextNode(list);
      }
    }
    fragment = fragment || document.createDocumentFragment();
    for (var i = 0, len = list.length; i < len; i++) {
      var item = list[i];
      if (typeof item === 'object') {
        for (var tagName in item) {
          var el = item[tagName];
          var append = el.append;
          delete el.append;
          var dEl;
          fragment.appendChild(dEl = mono.create(tagName, el));
          if (append !== undefined) {
            mono.parseTemplate(append, dEl);
          }
        }
      } else {
        fragment.appendChild(document.createTextNode(item));
      }
    }
    return fragment;
  };
  /**
   * @param {object} language
   * @param {Element} [body]
   */
  mono.writeLanguage = function(language, body) {
    "use strict";
    var elList = (body || document).querySelectorAll('[data-lang]');
    for (var i = 0, el; el = elList[i]; i++) {
      var langList = el.dataset.lang.split('|');
      for (var m = 0, lang; lang = langList[m]; m++) {
        var args = lang.split(',');
        var locale = language[args.shift()];
        if (locale === undefined) {
          console.log('Lang not found!', el.dataset.lang);
          continue;
        }
        if (args.length !== 0) {
          args.forEach(function (item) {
            if (item === 'text') {
              el.textContent = locale;
              return 1;
            } else
            if (item === 'tmpl') {
              el.textContent = '';
              el.appendChild(mono.parseTemplate(locale));
              return 1;
            }
            el.setAttribute(item, locale);
          });
        } else if (el.tagName === 'DIV') {
          el.setAttribute('title', locale);
        } else if (['A', 'LEGEND', 'SPAN', 'LI', 'TH', 'P', 'OPTION', 'H1', 'H2', 'H3'].indexOf(el.tagName) !== -1) {
          el.textContent = locale;
        } else if (el.tagName === 'INPUT') {
          el.value = locale;
        } else {
          console.log('Tag name not found!', el.tagName);
        }
      }
    }
  };

  mono.openTab = function(url) {
    "use strict";
    return chrome.tabs.create({url: url});
  };

  mono.throttle = function(fn, threshhold, scope) {
    threshhold = threshhold || 250;
    var last;
    var deferTimer;
    return function () {
      var context = scope || this;

      var now = Date.now();
      var args = arguments;
      if (last && now < last + threshhold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  };

  mono.debounce = function(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  };

  mono.capitalize = function(str) {
    "use strict";
    return str[0].toUpperCase() + str.substr(1);
  };


  mono.nodeListToArray = function(nodeList) {
    "use strict";
    return Array.prototype.slice.call(nodeList);
  };

  mono.parseParam = function(url, options) {
    options = options || {};
    var startFrom = url.indexOf('?');
    var query = url;
    if (!options.argsOnly && startFrom !== -1) {
      query = url.substr(startFrom + 1);
    }
    var sep = options.sep || '&';
    var dblParamList = query.split(sep);
    var params = {};
    for (var i = 0, len = dblParamList.length; i < len; i++) {
      var item = dblParamList[i];
      var ab = item.split('=');
      if (options.skipDecode) {
        params[ab[0]] = ab[1] || '';
      } else {
        params[ab[0]] = decodeURIComponent(ab[1] || '');
      }
    }
    return params;
  };

  mono.trigger = function(el, type, data) {
    if (data === undefined) {
      data = {};
    }
    if (data.bubbles === undefined) {
      data.bubbles = false;
    }
    if (data.cancelable === undefined) {
      data.cancelable = false;
    }
    var event = new CustomEvent(type, data);
    el.dispatchEvent(event);
  };

  mono.rmChildTextNodes = function(el) {
    "use strict";
    var index = 0;
    var node;
    while (node = el.childNodes[index]) {
      if (node.nodeType !== 3) {
        index++;
        continue;
      }
      el.removeChild(node);
    }
  };

  mono.getPosition = function(node) {
    var box = node.getBoundingClientRect();
    return {
      top: Math.round(box.top + window.pageYOffset),
      left: Math.round(box.left + window.pageXOffset),
      width: box.width,
      height: box.height
    }
  };

  mono.getSize = function(node) {
    return {width: node.offsetWidth, height: node.offsetHeight};
  };

  mono.domToTemplate = function(fragment, list) {
    "use strict";
    list = list || [];
    for (var i = 0, el; el = fragment.childNodes[i]; i++) {
      if (el.nodeType === 3) {
        list.push(el.textContent);
        continue;
      }
      var tagName = el.tagName;
      var obj = {};
      var item = [tagName, obj];

      if (tagName === 'A') {
        obj.href = el.getAttribute('href');
        obj.target = el.getAttribute('target') || undefined;
      }

      if (el.childNodes.length > 0) {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
          obj.text = el.childNodes[0].textContent;
        } else {
          obj.appendList = [];
          mono.domToTemplate(el, obj.appendList);
        }
      }
      list.push(item);
    }
    return list;
  };

  mono.templateToDom = function(list, fragment) {
    fragment = fragment || document.createDocumentFragment();
    for (var i = 0, len = list.length; i < len; i++) {
      var item = list[i];
      if (Array.isArray(item)) {
        var el = item[1];
        var dEl;
        fragment.appendChild(dEl = mono.create.apply(null, item));
        if (el.appendList !== undefined) {
          mono.templateToDom(el.appendList, dEl);
        }
      } else {
        fragment.appendChild(document.createTextNode(item));
      }
    }
    return fragment;
  };

  mono.getChild = function (node, cb) {
    var childNodes = node.childNodes;
    for (var i = 0, el; el = childNodes[i]; i++) {
      if (el.nodeType !== 1) {
        continue;
      }
      if (cb(el)) {
        return el;
      }
    }
    return null;
  };

  mono.hashParam = function(params) {
    "use strict";
    for (var key in params) {
      params[key] = mono.btoa(unescape(encodeURIComponent(params[key])));
    }
    params.base64 = 1;
    return mono.param(params);
  };

  mono.hashParseParam = function(string) {
    "use strict";
    var params = mono.parseParam(string);
    if (params.hasOwnProperty('base64')) {
      delete params.base64;
      for (var key in params) {
        try {
          params[key] = decodeURIComponent(escape(mono.atob(params[key])));
        } catch (e) {
          console.error('Error decode param', key, params[key]);
        }
      }
    }
    return params;
  };

  mono.deepClone = function (origData, prepValue) {
    "use strict";
    if (prepValue) {
      origData = prepValue(origData);
    }

    if (typeof origData !== 'object' || origData === null || origData instanceof RegExp) {
      return origData;
    }

    var data = null;
    if (Array.isArray(origData)) {
      var len = origData.length;
      data = new Array(len);
      for (var i = 0; i < len; i++) {
        data[i] = this.deepClone(origData[i], prepValue);
      }
      return data;
    }

    data = {};
    for (var key in origData) {
      if (!origData.hasOwnProperty(key)) {
        continue;
      }
      data[key] = this.deepClone(origData[key], prepValue);
    }
    return data;
  };

  mono.diffObj = function(origData, changeData, skipValue) {
    "use strict";
    if (skipValue) {
      if (skipValue.indexOf(changeData) !== -1) {
        return;
      }
    }

    if (origData === changeData) {
      return;
    }

    if (typeof origData !== 'object' || origData === null) {
      return changeData;
    }

    if (Array.isArray(origData) && Array.isArray(changeData)) {
      var isEq = !origData.some(function(value, index) {
        return value !== changeData[index];
      });
      if (isEq) {
        return;
      }
    }

    var diff = {};
    var value = null;

    Object.keys(origData).forEach(function(item) {
      if (!changeData.hasOwnProperty(item)) {
        changeData[item] = null;
      }
    });

    for (var key in changeData) {
      if (!changeData.hasOwnProperty(key)) {
        continue;
      }
      value = this.diffObj(origData[key], changeData[key], skipValue);
      if (typeof value === 'object' && value !== null) {
        if (!Array.isArray(value) && Object.keys(value).length === 0) {
          value = undefined;
        }
      }
      if (value !== undefined) {
        diff[key] = value;
      }
    }

    return diff;
  };

  mono.merge = function(origData, mergeData) {
    "use strict";
    if (typeof origData !== 'object' || origData === null || Array.isArray(origData)) {
      return mergeData;
    }

    if (typeof mergeData !== 'object' || mergeData === null || Array.isArray(mergeData)) {
      return mergeData;
    }

    for (var key in mergeData) {
      if (!mergeData.hasOwnProperty(key)) {
        continue;
      }
      origData[key] = this.merge(origData[key], mergeData[key]);
    }

    return origData;
  };

  mono.Layer = function(details) {
    "use strict";
    details = details || {};
    var _this = this;
    this.blocks = {};
    this.blocks.layer = mono.create('div', {
      class: ['ml-layer-back'],
      on: ['click', function(e) {
        e.stopPropagation();
        _this.close();
      }]
    });
    this.blocks.head = mono.create('div', {
      class: 'ml-head',
      append: [
        mono.create('span', {
          text: details.title || ''
        }),
        mono.create('a', {
          text: mono.language.close,
          href: '#',
          on: ['click', function(e) {
            e.preventDefault();
            _this.close();
          }]
        })
      ]
    });
    this.blocks.body = mono.create('div', {
      class: 'ml-body'
    });
    this.blocks.footer = mono.create('div', {
      class: 'ml-footer',
      append: [
        mono.create('a', {
          class: ['btn', 'save'],
          text: mono.language.save,
          href: '#',
          on: ['click', function(e) {
            e.preventDefault();
            _this.close(1);
          }]
        })
      ]
    });
    this.blocks.container = mono.create('div', {
      class: 'ml-layer',
      append: [
        this.blocks.head,
        this.blocks.body,
        this.blocks.footer
      ]
    });
    this.blocks.container = mono.create('div', {
      class: ['ml-wrapper'],
      append: [
        this.blocks.container
      ],
      on: ['click', function(e) {
        e.stopPropagation();
      }]
    });
    this.show = function() {
      document.body.appendChild(this.blocks.layer);
      document.body.appendChild(this.blocks.container);

      details.onShow && details.onShow();
    };
    this.close = function(isSave) {
      if (isSave) {
        details.onSave && details.onSave();
      } else {
        details.onCancel && details.onCancel();
      }

      this.blocks.layer.parentNode.removeChild(this.blocks.layer);
      this.blocks.container.parentNode.removeChild(this.blocks.container);

      details.onClose && details.onClose();
    };
  };

  mono.extend = function() {
    var obj = arguments[0];
    for (var i = 1, len = arguments.length; i < len; i++) {
      var item = arguments[i];
      for (var key in item) {
        if (item[key] !== undefined) {
          obj[key] = item[key];
        }
      }
    }
    return obj;
  };

  mono.language = {};

  mono.loadLanguage = function (customLang, cb) {
    var _this = this;
    var langList = ['en', 'ru'];
    var defaultLocale = langList[0];
    var locale = null;
    if (customLang && langList.indexOf(customLang) !== -1) {
      locale = customLang;
    }
    locale = locale || mono.getLoadedLocale();
    if (langList.indexOf(locale) === -1) {
      locale = defaultLocale;
    }

    _this.getLanguage(locale, function (err, _language) {
      if (err) {
        throw err;
      }

      _this.extend(_this.language, _language);
      cb();
    });
  };

  mono.cloneObj = function (a) {
    return JSON.parse(JSON.stringify({w: a})).w;
  };

  return mono;
}));