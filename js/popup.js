var popup = function(enable_ac) {
    var var_cache = {
        suggest_xhr: undefined
    };
    var dom_cache = {};
    var options = {
        autoComplete: enable_ac
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

        var xhr;
        if (mono.isFF) {
            xhr = {};
            xhr.open = [method, url, true];
        } else {
            xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
        }

        if (obj.dataType) {
            xhr.responseType = obj.dataType.toLowerCase();
        }

        if (!obj.headers) {
            obj.headers = {};
        }

        if (obj.contentType) {
            obj.headers["Content-Type"] = obj.contentType;
        }

        if (data && !obj.headers["Content-Type"]) {
            obj.headers["Content-Type"] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }

        if (mono.isFF) {
            xhr.headers = obj.headers;
            xhr.mimeType = obj.mimeType;
            xhr.data = data;
            xhr.id = Math.floor((Math.random() * 10000) + 1);

            mono.sendMessage({action: 'xhr', data: xhr}, function(_xhr) {
                xhr.status = _xhr.status;
                xhr.statusText = _xhr.statusText;
                xhr.response = _xhr.response;
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    return obj.success && obj.success(xhr.response);
                }
                obj.error && obj.error();
            }, "service");

            xhr.abort = function() {
                mono.sendMessage({action: 'xhrAbort', data: xhr.id}, undefined, "service");
            }
        } else {
            if (obj.mimeType) {
                xhr.overrideMimeType(obj.mimeType);
            }
            if (obj.headers) {
                for (var key in obj.headers) {
                    xhr.setRequestHeader(key, obj.headers[key]);
                }
            }
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    return obj.success && obj.success((obj.dataType) ? xhr.response : xhr.responseText);
                }
                obj.error && obj.error();
            };
            xhr.onerror = obj.error;
            xhr.send(data);
        }

        return xhr;
    };

    var getHistory = function (cb) {
        /*
         * Отдает массив поисковых запросов из истории
         */
        mono.storage.get('history', function(storage) {
            var history = storage.history || [];
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
        var url = 'index.html' + ( (text) ? '#?search=' + text : '' );
        if (mono.isChrome) {
            chrome.tabs.create({
                url: url
            });
        }
        if (mono.isFF) {
            mono.sendMessage({action: 'openTab', dataUrl: true, url: url}, undefined, 'service');

            dom_cache.search_input.val('').focus();
            dom_cache.clear.hide();

            return mono.addon.postMessage('closeMe');
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
        },
        open: function() {
            mono.sendMessage({action: 'resize', height: 220 }, undefined, "service");
        },
        close: function() {
            mono.sendMessage({action: 'resize', height: 66 }, undefined, "service");
        }
    });
    if (mono.isFF) {
        mono.onMessage(function(message) {
            if (message === 'show') {
                dom_cache.search_input.focus();
            }
        });
        dom_cache.search_input.focus();
    }
};
mono.pageId = 'popup';
mono.isFF && mono.onMessage(function() {});
mono.storage.get(['lang', 'AutoComplite_opt'],function(storage) {
    window._lang = get_lang(storage.lang || navigator.language.substr(0, 2));
    if (storage.AutoComplite_opt === undefined) {
        storage.AutoComplite_opt = 1;
    }
    $(function(){
        popup(storage.AutoComplite_opt);
    });
});