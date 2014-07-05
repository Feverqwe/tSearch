var ToggleButton = require('sdk/ui/button/toggle').ToggleButton;
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");
var monoLib = require("./monoLib.js");
var lang = require("./lang.js");

var pageMod = require("sdk/page-mod");
pageMod.PageMod({
    include: [
        self.data.url()+'*'
    ],
    exclude: self.data.url("popup.html"),
    contentScript: '('+monoLib.virtualPort.toString()+')()',
    contentScriptWhen: 'start',
    contentScriptOptions: {
        monoVirtual: true,
        pageId: 'tab',
        defaultId: 'monoScope'
    },
    onAttach: function(tab) {
        tab.port.on('monoAttach', function(message) {
            monoLib.addPage(message, tab);
        });
    }
});

var createTab = function() {
    button.state('window', {checked: false});
    var tab = tabs.open({
        url: self.data.url("index.html")
    });
};

var button = ToggleButton({
    id: "tTMSOpenBtn",
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
        monoLib.storage.get('monoLocalStorage', function(ls) {
            var createPopup = true;
            if (ls.monoLocalStorage && ls.monoLocalStorage.search_popup === 0) {
                createPopup = false;
            }
            if (createPopup) {
                if (popup.show === undefined) {
                    popup = popup();
                } else {
                    popup.show({
                        position: button
                    });
                }
            } else {
                createTab();
            }
        });
    }
});

var popup = function() {
    var popup = panels.Panel({
        width: 620,
        height: 66,
        contentURL: self.data.url("popup.html"),
        onHide: function () {
            button.state('window', {checked: false});
        },
        onShow: function () {
            monoLib.sendAll({
                data: 'show',
                monoTo: 'monoScope',
                monoFrom: 'system'
            });
        },
        onMessage: function (msg) {
            if (msg === 'closeMe') {
                popup.hide();
            }
        }
    });
    monoLib.addPage('popup', popup);
    popup.show({
        position: button
    });
    return popup;
};


var bg = require("./background.js");
var bg_addon = monoLib.virtualAddon('bg');

monoLib.addPage('bg', bg_addon);

bg.init(bg_addon, lang);