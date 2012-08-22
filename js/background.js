var bg = function () {
    var add_in_omnibox = function () {
        var add_in_omnibox = (GetSettings('add_in_omnibox') !== undefined) ? parseInt(GetSettings('add_in_omnibox')) : true;
        if (add_in_omnibox) {
            chrome.omnibox.onInputEntered.addListener(function(text) {
                chrome.tabs.create({
                    "url":"index.html#s=" + text,
                    "selected":true
                });
            });
        }
    }
    var update_context_menu = function () {
        var context_menu = (GetSettings('context_menu') !== undefined) ? parseInt(GetSettings('context_menu')) : true;
        if (context_menu)
            chrome.contextMenus.removeAll(function () {
                if (context_menu) {
                    chrome.contextMenus.create({
                        "type" : "normal",
                        "id" : "item",
                        "title" : "Найти торрент",
                        "contexts" : ["selection"],
                        "onclick" : function (info) {
                            chrome.tabs.create({
                                "url":"index.html#s=" + info.selectionText,
                                "selected":true
                            });
                        }
                    });
                }
            });
    }
    return {
        add_in_omnibox : function () {
            return add_in_omnibox();
        },
        update_context_menu : function () {
            return update_context_menu();
        }
    }
}();
bg.add_in_omnibox();
bg.update_context_menu();