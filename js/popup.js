var popup = function() {
    var var_cache = {
        suggest_xhr: undefined
    };
    var dom_cache = {};
    var options = {
        autoComplete: parseInt(mono.localStorage.get('AutoComplite_opt') || 1)
    };
    var ajax = function(obj) {
        var url = obj.url;

        var method = obj.type || 'GET';
        method.toUpperCase();

        var data = obj.data;

        if (data && typeof data !== "string") {
            data = $.param(data);

            if (method === 'GET') {
                url += ( (url.indexOf('?') === -1)?'?':'&' ) + data;
                data = undefined;
            }
        }

        if (obj.cache === false && ['GET','HEAD'].indexOf(method) !== -1) {
            var nc = '_=' + Date.now();
            url += ( (url.indexOf('?') === -1)?'?':'&' ) + nc;
        }

        var xhr = new XMLHttpRequest();

        if (obj.mimeType) {
            xhr.overrideMimeType( obj.mimeType );
        }

        if (obj.dataType) {
            xhr.responseType = obj.dataType.toLowerCase();
        }

        if (obj.contentType) {
            if (!obj.headers) {
                obj.headers = {};
            }
            obj.headers["Content-Type"] = obj.contentType;
        }

        if (obj.headers) {
            for (var key in obj.headers) {
                xhr.setRequestHeader(key, obj.headers[key]);
            }
        }

        xhr.open(method, url, true);

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                return obj.success && obj.success( (obj.dataType)?xhr.response:xhr.responseText );
            }
            obj.error && obj.error();
        };

        xhr.onerror = obj.error;

        xhr.send( obj.data );

        return xhr;
    };
    var getHistory = function (cb) {
        /*
         * Отдает массив поисковых запросов из истории
         */
        mono.storage.get('history', function(storage) {
            var history = JSON.parse(storage.history || "[]");
            history.sort(function(a,b){
                if (a.count === b.count) {
                    return 0;
                } else if (a.count < b.count) {
                    return 1;
                } else {
                    return -1;
                }
            });
            var list = [];
            for (var i = 0, item; item = history[i]; i++) {
                list.push(item.title);
            }
            cb(list)
        });
    };
    dom_cache.search_input = $('input[type="text"]');
    dom_cache.submit = $('input[type="submit"]');
    dom_cache.form_search = $('form');
    dom_cache.clear = $('div.btn.clear');

    dom_cache.submit.val(_lang['btn_form']);
    dom_cache.clear.attr('title', _lang.btn_filter);

    dom_cache.form_search.submit(function(e) {
        e.preventDefault();
        var text = dom_cache.search_input.val();
        if (mono.isChrome) {
            chrome.tabs.create({
                url: 'index.html' + ( (text.length > 0) ? '#?search=' + text : '' )
            });
        }
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
            if (a.term.length === 0 || options.autoComplete === 0) {
                getHistory(response);
            } else {
                if (var_cache.suggest_xhr !== undefined) {
                    var_cache.suggest_xhr.abort();
                }
                var_cache.suggest_xhr = ajax({
                    url: 'http://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(a.term),
                    dataType: 'JSON',
                    success: function(data) {
                        response(data[1]);
                    }
                });
            }
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
};
mono.localStorage(function() {
   $(function(){
        popup();
   });
});