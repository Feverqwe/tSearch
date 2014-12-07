(function() {
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
    sp.on("settingsBtn", function() {
        var tabs = require("sdk/tabs");
        tabs.open( self.data.url('options.html') );
    });
    sp.on("openBtn", function() {
        var tabs = require("sdk/tabs");
        tabs.open( self.data.url('index.html') );
    });

    pageMod.PageMod({
        include: [
            self.data.url()+'*'
        ],
        contentScript: '('+monoLib.virtualPort.toString()+')()',
        contentScriptWhen: 'start',
        onAttach: function(tab) {
            monoLib.addPage(tab);
        }
    });

    var createTab = function() {
        var tabs = require("sdk/tabs");
        button.state('window', {checked: false});
        tabs.open({
            url: self.data.url("index.html")
        });
    };

    var button = mobileMode?undefined:ToggleButton({
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
            monoLib.storage.get('searchPopup', function(ls) {
                var createPopup = ls.searchPopup !== 0;
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

    var popup = mobileMode?undefined:panels.Panel({
        width: 642,
        height: 70,
        contentURL: self.data.url("popup.html"),
        onHide: function () {
            button.state('window', {checked: false});
        },
        onShow: function () {
            popup.port.emit('mono', {
                data: 'show'
            });
        },
        onMessage: function (msg) {
            if (msg === 'closeMe') {
                popup.hide();
            }
        }
    });
    popup && monoLib.addPage(popup);


    var bgAddon = monoLib.virtualAddon();
    monoLib.addPage(bgAddon);

    var bg = require("./background.js");
    bg.init(bgAddon, button);
})();