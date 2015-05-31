(function () {
    "use strict";
    var mobileMode = false;
    try {
        var ToggleButton = require('sdk/ui/button/toggle').ToggleButton;
        var panels = require("sdk/panel");
    } catch (e) {
        mobileMode = true;
    }

    var self = require("sdk/self");
    var monoLib = require("./monoLib.js");
    var pageMod = require("sdk/page-mod");

    var sp = require("sdk/simple-prefs");
    sp.on("settingsBtn", function () {
        var tabs = require("sdk/tabs");
        tabs.open(self.data.url('options.html'));
    });
    sp.on("openBtn", function () {
        var tabs = require("sdk/tabs");
        tabs.open(self.data.url('index.html'));
    });

    pageMod.PageMod({
        include: [
            self.data.url() + '*'
        ],
        contentScript: '(' + monoLib.virtualPort.toString() + ')()',
        contentScriptWhen: 'start',
        onAttach: function (tab) {
            monoLib.addPage(tab);
        }
    });

    var createTab = function () {
        var tabs = require("sdk/tabs");
        button.state('window', {checked: false});
        tabs.open({
            url: self.data.url("index.html")
        });
    };

    var button = mobileMode ? undefined : ToggleButton({
        id: "TmsBtn",
        label: "Torrents MultiSearch",
        icon: {
            "16": "./icons/icon-16.png",
            "32": "./icons/icon-32.png",
            "64": "./icons/icon-64.png"
        },
        onChange: function (state) {
            if (!state.checked) {
                return;
            }
            monoLib.storage.get('searchPopup', function (storage) {
                if (!storage.hasOwnProperty('searchPopup')) {
                    storage.searchPopup = 1;
                }
                if (!storage.searchPopup) {
                    return createTab();
                }
                if (popup.show === undefined) {
                    popup = popup();
                } else {
                    popup.show({
                        position: button
                    });
                }
            });
        }
    });

    var popup;
    var initPopup = function() {
        "use strict";
        if (mobileMode) {
            return;
        }
        popup = panels.Panel({
            contextMenu: true,
            contentURL: self.data.url("popup.html"),
            onHide: function () {
                button.state('window', {checked: false});
            },
            onShow: function () {
                popup.port.emit('mono', {
                    data: {action: 'empty'}
                });
            },
            onMessage: function (msg) {
                if (msg === 'hidePopup') {
                    popup.hide();
                }
            }
        });
        monoLib.addPage(popup);
    };

    var bgAddon = monoLib.virtualAddon();
    monoLib.addPage(bgAddon);

    var bg = require("./bg.js");
    bg.init(bgAddon, button, initPopup);

    (function() {
        var sanitizerHTML = function (html) {
            if (typeof html !== 'string') {
                return html;
            }

            var chrome = require('chrome');
            var Cc = chrome.Cc;
            var Ci = chrome.Ci;
            chrome = null;

            var flags = 2;

            var regexpList = sanitizerHTML.regexpList;

            html = html.replace(regexpList.findUrl, function(str, arg1, arg2) {
                "use strict";
                var data = arg2;
                if (arg2.search(regexpList.findeJs) === 0) {
                    data = '';
                } else
                if (arg2[0] === '/' || arg2.substr(0, 4) !== 'http') {
                    data = 'http://'+regexpList.id+'#' + arg2
                }
                return 'href='+arg1+data+arg1;
            });

            var parser = Cc["@mozilla.org/parserutils;1"].getService(Ci.nsIParserUtils);
            var sanitizedHTML = parser.sanitize(html, flags);

            sanitizedHTML = sanitizedHTML.replace(regexpList.rmBaseUrl, '');

            return sanitizedHTML;
        };

        var id = (require("sdk/self")).id.replace(/[^\w\d]/g, '_');
        sanitizerHTML.regexpList = {};
        sanitizerHTML.regexpList.rmBaseUrl = new RegExp('http:\\/\\/'+id+'#', 'gm');
        sanitizerHTML.regexpList.findUrl = /href=(['"])([^'"]+)\1/img;
        sanitizerHTML.regexpList.findeJs = /javascript/i;
        sanitizerHTML.regexpList.id = id;
        id = undefined;

        var xhrList = {};
        monoLib.serviceList.xhr = function(message, response) {
            "use strict";
            var wait = true;
            var getVXhr = function(cbType) {
                if (!wait) {
                    return;
                }
                wait = false;

                delete xhrList[id];

                vXhr.status = xhr.status;
                vXhr.statusText = xhr.statusText;
                vXhr.responseURL = xhr.responseURL;

                if (vXhr.responseType) {
                    vXhr.response = vXhr.safe ? sanitizerHTML(xhr.response) : xhr.response;
                } else {
                    vXhr.responseText = vXhr.safe ? sanitizerHTML(xhr.responseText) : xhr.responseText;
                }
                vXhr.cbType = cbType;

                response(vXhr);
            };

            var vXhr = message.data.data;
            var id = vXhr.id;
            var xhr = xhrList[id] = new (require('sdk/net/xhr').XMLHttpRequest)();
            if (vXhr.url.substr(0, 4) !== 'http') {
                vXhr.url = (require("sdk/self")).data.url(vXhr.url);
            }
            xhr.open(vXhr.method, vXhr.url, vXhr.async);
            vXhr.mimeType && xhr.overrideMimeType(vXhr.mimeType);
            for (var key in vXhr.headers) {
                xhr.setRequestHeader(key, vXhr.headers[key]);
            }
            if (vXhr.timeout) {
                xhr.timeout = vXhr.timeout;
                xhr.ontimeout = getVXhr.bind(null, 'ontimeout')
            }
            if (vXhr.responseType) {
                xhr.responseType = vXhr.responseType;
            }

            xhr.onload = getVXhr.bind(null, 'onload');

            xhr.onerror = getVXhr.bind(null, 'onerror');

            xhr.onabort = getVXhr.bind(null, 'onabort');

            xhr.send(vXhr.data);
        };
        monoLib.serviceList.xhrAbort = function(message) {
            "use strict";
            var data = message.data;
            var id = data.id;
            if (xhrList.hasOwnProperty(id)) {
                xhrList[id].abort();
                delete xhrList[id];
            }
        };
    })();
})();