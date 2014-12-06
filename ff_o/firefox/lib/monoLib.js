/**
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine. Firefox lib.
 *
 */

(function() {
  var map = {};
  /**
   * @namespace exports
   * @namespace require
   */

  /**
   * type {function}
   * @returns {number}
   */
  var getPageId = function() {
    if (getPageId.value === undefined) {
      getPageId.value = -1;
    }
    return ++getPageId.value;
  };

  var getMonoPage = function(page) {
    for (var index in map) {
      if (map[index].page === page) {
        return map[index];
      }
    }
    return undefined;
  };

  var virtualPageList = [];
  exports.virtualAddon = function() {
    var subscribClientList = {};
    var subscribServerList = {};
    var obj = {
      port: {
        emit: function(to, message) {
          var list = subscribServerList[to];
          if (list === undefined) {
            return;
          }
          for (var i = 0, item; item = list[i]; i++) {
            item(message);
          }
        },
        on: function(to, cb) {
          if (subscribClientList[to] === undefined) {
            subscribClientList[to] = [];
          }
          subscribClientList[to].push(cb);
        }
      },
      lib: {
        emit: function(to, message) {
          var list = subscribClientList[to];
          if (list === undefined) {
            return;
          }
          for (var i = 0, item; item = list[i]; i++) {
            item(message);
          }
        },
        on: function(to, cb) {
          if (subscribServerList[to] === undefined) {
            subscribServerList[to] = [];
          }
          subscribServerList[to].push(cb);
        }
      },
      isVirtual: true
    };
    virtualPageList.push(obj);
    return obj;
  };

  exports.virtualPort = function() {
    window.addEventListener('message', function(e) {
      if (e.data[0] !== '>') {
        return;
      }
      var json = JSON.parse(e.data.substr(1));
      self.port.emit('mono', json);
    });
    self.port.on('mono', function (message) {
      var msg = '<' + JSON.stringify(message);
      var event = new CustomEvent("monoMessage", {detail: msg});
      window.dispatchEvent(event);
    });
  };

  var bindPage = function(mPage) {
    var page = mPage.page;
    if (page.isVirtual) return;

    var onPageShow = function() {
      mPage.active = true;
    };
    var onPageHide = function() {
      mPage.active = false;
    };
    var onAttach = function() {
      mPage.active = true;
      map[mPage.id] = mPage;
    };
    var onDetach = function() {
      delete map[mPage.id];
      mPage.active = false;
    };

    page.on('pageshow', onPageShow);
    page.on('pagehide', onPageHide);
    page.on('attach', onAttach);
    page.on('detach', onDetach);
  };

  var sendHook = {
    activeTab: function(message) {
      var tabs = require("sdk/tabs");
      var currentTab = tabs.activeTab;
      var pageId;
      for (var index in map) {
        if (map[index].page.tab === currentTab && map[index].page.url === currentTab.url) {
          pageId = map[index].id;
          break;
        }
      }
      if (pageId === undefined) {
        return;
      }
      message.to = pageId;
      monoOnMessage(message);
    },
    popupWin: function(message) {
      var self = require("sdk/self");
      var url = 'resource://'+self.id.slice(1, -1)+'/';
      var pageId;
      for (var index in map) {
        var page = map[index].page;
        if (page.isShowing !== undefined && page.tab === null && page.url.indexOf(url) === 0) {
          pageId = map[index].id;
          break;
        }
      }
      if (pageId === undefined) {
        return;
      }
      message.to = pageId;
      monoOnMessage(message);
    }
  };

  var monoOnMessage = function(message) {
    if (message.hook !== undefined) {
      var hookFunc = sendHook[message.hook];
      if (hookFunc !== undefined) {
        delete message.hook;
        return hookFunc(message);
      }
    }
    if (message.to !== undefined) {
      var mPage = map[message.to];
      if (!mPage || mPage.active === false) {
        return;
      }
      var type = (mPage.page.isVirtual !== undefined) ? 'lib' : 'port';
      return mPage.page[type].emit('mono', message);
    }
    for (var i = 0, item; item = virtualPageList[i]; i++) {
      item.lib.emit('mono', message);
    }
  };

  exports.addPage = function(page) {
    var mPage = getMonoPage(page);
    if (mPage) {
      return;
    }
    mPage = {
      page: page,
      id: getPageId(),
      active: true
    };
    map[mPage.id] = mPage;

    bindPage(mPage);

    var type = (page.isVirtual !== undefined) ? 'lib' : 'port';
    page[type].on('mono', function(message) {
      message.from = mPage.id;
      monoOnMessage(message);
    });
  };

var ffSimpleStorage = (function() {
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
})();
exports.storage = ffSimpleStorage;

sendHook.monoStorage = function(message) {
  var msg = message.data || {};
  var response = function(responseMessage) {
    responseMessage = {
      data: responseMessage,
      to: message.from,
      responseId: message.callbackId
    };
    monoOnMessage(responseMessage);
  };
  var func = ffSimpleStorage[msg.action];
  if (func === undefined) return;
  if (msg.action === 'clear') {
    func(response);
  } else {
    func(msg.data, response);
  }
};

/**
 * @namespace sendHook {object}
 * @namespace monoOnMessage {function}
 * @namespace map {array}
 */
var serviceList = {
  resize: function(message) {
    var mPage = map[message.from];
    if (!mPage || mPage.active === false) {
      return;
    }
    var msg = message.data || {};

    if (msg.width) {
      mPage.page.width = msg.width;
    }
    if (msg.height) {
      mPage.page.height = msg.height;
    }
  },
  openTab: function(message) {
    var msg = message.data || {};
    var self = require("sdk/self");
    var tabs = require("sdk/tabs");
    tabs.open( (msg.dataUrl) ? self.data.url(msg.url) : msg.url );
  }
};

var sanitizerHTML = function (html) {
  var self = require("sdk/self");
  var chrome = require('chrome');
  var Cc = chrome.Cc;
  var Ci = chrome.Ci;

  var flags = 2;

  if (sanitizerHTML.regexpList === undefined) {
    sanitizerHTML.regexpList = [];
  }
  var sanitizeRegExp = sanitizerHTML.regexpList;

  if (!sanitizeRegExp[1]) {
    var id = self.id.replace(/[^\w\d]/g, '_');
    sanitizeRegExp[1] = new RegExp('http:\\/\\/'+id+'#', 'gm');
    sanitizeRegExp[0] = /href=(['"]{1})([^'"]*)(?:['"]{1})/img;
    sanitizeRegExp[2] = /javascript/i;
    sanitizeRegExp[3] = id;
  }

  html = html.replace(sanitizeRegExp[0], function(str, arg1, arg2) {
    "use strict";
    var data = arg2;
    if (arg2.search(sanitizeRegExp[2]) === 0) {
      data = '';
    } else
    if (arg2[0] === '/' || arg2.substr(0, 4) !== 'http') {
      data = 'http://'+sanitizeRegExp[3]+'#' + arg2
    }
    return 'href='+arg1+data+arg1;
  });

  var parser = Cc["@mozilla.org/parserutils;1"].getService(Ci.nsIParserUtils);
  var sanitizedHTML = parser.sanitize(html, flags);

  sanitizedHTML = sanitizedHTML.replace(sanitizeRegExp[1], '');

  return sanitizedHTML;
};

serviceList.xhr = function(message, response) {
  var msg = message.data || {};
  if (!serviceList.xhr.xhrList) {
    serviceList.xhr.xhrList = {};
  }
  var xhrList = serviceList.xhr.xhrList;

  var XMLHttpRequest = require('sdk/net/xhr').XMLHttpRequest;
  var obj = msg.data;
  var xhr = new XMLHttpRequest();
  xhr.open(obj.open[0], obj.open[1], obj.open[2], obj.open[3], obj.open[4]);
  xhr.responseType = obj.responseType;
  if (obj.mimeType) {
    xhr.overrideMimeType(obj.mimeType);
  }
  if (obj.headers) {
    for (var key in obj.headers) {
      xhr.setRequestHeader(key, obj.headers[key]);
    }
  }
  if (obj.responseType) {
    xhr.responseType = obj.responseType;
  }
  xhr.onload = xhr.onerror = function() {
    delete xhrList[obj.id];
    return response({
      status: xhr.status,
      statusText: xhr.statusText,
      response: (obj.responseType)?xhr.response:(obj.safe)?sanitizerHTML(xhr.responseText):xhr.responseText
    });
  };
  xhr.send(obj.data);
  if (obj.id) {
    xhrList[obj.id] = xhr;
  }
};
serviceList.xhrAbort = function(message) {
  var msg = message.data || {};
  var xhrList = serviceList.xhr.xhrList || {};

  var xhr = xhrList[msg.data];
  if (xhr) {
    xhr.abort();
    delete xhrList[msg.data];
  }
};

sendHook.service = function(message) {
  var msg = message.data || {};

  var response = function(responseMessage) {
    responseMessage = {
      data: responseMessage,
      to: message.from,
      responseId: message.callbackId
    };
    monoOnMessage(responseMessage);
  };
  var service = serviceList[msg.action];
  if (service !== undefined) {
    service(message, response);
  }
};

})();