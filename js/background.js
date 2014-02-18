var bg = function() {
    var add_in_omnibox = function() {
        var add_in_omnibox = parseInt(GetSettings('add_in_omnibox') || 1);
        if (add_in_omnibox === 0) {
            return;
        }
        chrome.omnibox.onInputEntered.addListener(function(text) {
            chrome.tabs.create({
                url: "index.html" + ( (text.length > 0)?'#?search='+text:''),
                selected: true
            });
        });
    };
    var update_context_menu = function() {
        var context_menu = parseInt(GetSettings('context_menu') || 1);
        chrome.contextMenus.removeAll(function() {
            if (context_menu === 0) {
                return;
            }
            chrome.contextMenus.create({
                type: "normal",
                id: "item",
                title: _lang.ctx_title,
                contexts: ["selection"],
                onclick: function(info) {
                    var text = info.selectionText;
                    chrome.tabs.create({
                        url: 'index.html' + ( (text.length > 0)?'#?search='+text:''),
                        selected: true
                    });
                }
            });
        });
    };
    return {
        add_in_omnibox: add_in_omnibox,
        update_context_menu: update_context_menu
    };
}();
bg.add_in_omnibox();
bg.update_context_menu();