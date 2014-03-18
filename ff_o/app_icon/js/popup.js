$(function() {

    var var_cache = {
        suggest_xhr: undefined
    };
    var dom_cache = {};
    var default_id = 'pakhafflipopfhfmnbhoocpkcdjfpphc';
    var options = {
        id: localStorage['id']
    };
    (function getExtId() {
        if (options.id !== undefined && options.id.length > 0) {
            return;
        }
        chrome.management.getAll(function(extensions) {
            var item, i;
            var len = extensions.length;
            for (i = 0; i < len; i++) {
                item = extensions[i];
                if (item.enabled !== true || item.type === "extension" || item.type === "theme") {
                    continue;
                }
                if (item.id === default_id) {
                    options.id = item.id;
                    return;
                }
            }
            for (i = 0; i < len; i++) {
                item = extensions[i];
                if (item.enabled !== true || item.type === "extension" || item.type === "theme") {
                    continue;
                }
                if (item.name === "TMS - Поиск торрентов" || item.name === "TMS - Torrent search") {
                    options.id = item.id;
                    return;
                }
            }
            chrome.tabs.create({url: 'https://chrome.google.com/webstore/detail/pakhafflipopfhfmnbhoocpkcdjfpphc'});
            options.id = def_id;
            return;
        });
    })();
    dom_cache.search_input = $('input[type="text"]');
    dom_cache.submit = $('input[type="submit"]');
    dom_cache.form_search = $('form');
    dom_cache.clear = $('div.btn.clear');

    dom_cache.submit.val(_lang['btn_form']);
    dom_cache.clear.attr('title', _lang.btn_filter);

    dom_cache.form_search.submit(function(e) {
        e.preventDefault();
        var root_url = 'chrome-extension://' + options.id + '/';
        var text = dom_cache.search_input.val();
        chrome.tabs.create({
            url: root_url+'index.html' + ( (text.length > 0)?'#?search='+text:'' )
        });
        window.close();
    });
    dom_cache.clear.on("click", function(e) {
        e.preventDefault();
        dom_cache.search_input.val('').focus();
        $(this).hide();
    });
    dom_cache.search_input.on('keyup', function() {
        if (this.value.length > 0) {
            dom_cache.clear.show();
        } else {
            dom_cache.clear.hide();
        }
    });
    dom_cache.search_input.autocomplete({
        source: function(a, response) {
            if (var_cache.suggest_xhr !== undefined) {
                var_cache.suggest_xhr.abort();
            }
            var request = a.term;
            if (request.length === 0) {
                response();
                return;
            }
            var_cache.suggest_xhr = $.getJSON('http://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(request)).success(
                function(data) {
                    response(data[1]);
                }
            );
        },
        /*
         * experimental API
         */
        messages: {
            noResults: '',
            results: function() {}
        },
        minLength: 0,
        select: function(event, ui) {
            this.value = ui.item.value;
            $(this).trigger('keyup');
            dom_cache.form_search.trigger('submit');
        },
        position: {
            collision: "bottom"
        }
    })
});