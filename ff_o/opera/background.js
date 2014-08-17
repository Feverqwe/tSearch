(function() {
    mono.pageId = 'service';
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
                    width: 640,
                    height: 70
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
        if (message.action === 'tab') {
            var tab = opera.extension.tabs.create({url: message.url});
            tab.focus();
            return;
        }
        if (message.action === 'resize') {
            if (message.height) {
                var_cache.button.popup.height = message.height;
            }
            if (message.width) {
                var_cache.button.popup.width = message.width;
            }
        }
        if (message === 'bg_update') {
            mono.storage.get(['contextMenu', 'searchPopup'], function (storage) {
                updateContextMenu( storage.contextMenu );
                updateButton( storage.searchPopup );
            });
        }
    });
    window.addEventListener('DOMContentLoaded', function() {
        mono.storage.get(['lang', 'contextMenu', 'searchPopup'], function (storage) {
            if (storage.contextMenu === undefined) {
                storage.contextMenu = 1;
            }
            if (storage.searchPopup === undefined) {
                storage.searchPopup = 1;
            }
            window._lang = get_lang(storage.lang || navigator.language.substr(0, 2));
            updateContextMenu( storage.contextMenu );
            updateButton( storage.searchPopup );
        });
    });
})();