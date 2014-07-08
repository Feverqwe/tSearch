(function() {
    var var_cache = {};
    var updateButton = function(active) {
        if (var_cache.button) {
            opera.contexts.toolbar.removeItem(var_cache.button);
        }
        var ToolbarUIItemProperties = {
            disabled: false,
            title: "Torrents MultiSearch",
            icon: "icons/icon-18.png"
        };
        if (active) {
            ToolbarUIItemProperties.popup = {
                href: 'build/popup.html',
                    width: 600,
                    height: 66
            }
        } else {
            ToolbarUIItemProperties.onclick = function() {
                var tab = opera.extension.tabs.create({url: 'build/index.html'});
                tab.focus();
            }
        }
        var_cache.button = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
        opera.contexts.toolbar.addItem(var_cache.button);
    };
    var updateContextMenu = function(active) {
        if (!opera.contexts.menu) {
            return;
        }
        var menu = opera.contexts.menu;
        if (menu.length > 0) {
            menu.removeItem(0);
        }
        if (active !== 1) {
            return;
        }
        // Create a menu item properties object
        var itemProps = {
            title: _lang.ctx_title,
            contexts: ['selection'],
            icon: 'icons/icon-16.png',
            onclick: function(event) {
                var query = encodeURIComponent(event.selectionText);
                var tabProps = {
                    url: 'build/index.html' + ((query)?'#?search=' + query:'')
                };
                opera.extension.tabs.create(tabProps);
            }
        };
        var item = menu.createItem(itemProps);
        menu.addItem(item);
    };
    mono.onMessage(function(message) {
        console.log('message!', message);
        if (message !== 'bg_update') {
            return;
        }
        mono.storage.get(['context_menu', 'search_popup'], function (storage) {
            updateContextMenu( storage.context_menu );
            updateButton( storage.search_popup );
        });
    });
    window.addEventListener('DOMContentLoaded', function() {
        mono.storage.get(['lang', 'context_menu', 'search_popup'], function (storage) {
            if (storage.context_menu === undefined) {
                storage.context_menu = 1;
            }
            if (storage.search_popup === undefined) {
                storage.search_popup = 1;
            }
            window._lang = get_lang(storage.lang || navigator.language.substr(0, 2));
            updateContextMenu( storage.context_menu );
            updateButton( storage.search_popup );
        });
    });
})();