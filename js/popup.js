var popup = function(enable_ac) {
    var var_cache = {
        suggest_xhr: undefined
    };
    var dom_cache = {};
    var options = {
        autoComplete: enable_ac
    };

    var write_language = function(body) {
        var elList = (body || document).querySelectorAll('[data-lang]');
        for (var i = 0, el; el = elList[i]; i++) {
            var langList = el.dataset.lang.split('|');
            for (var m = 0, lang; lang = langList[m]; m++) {
                var args = lang.split(',');
                var locale = _lang[args.shift()];
                if (locale === undefined) {
                    console.log('Lang not found!', el.dataset.lang);
                    continue;
                }
                if (args.length !== 0) {
                    args.forEach(function (item) {
                        if (item === 'text') {
                            el.textContent = locale;
                            return 1;
                        }
                        if (item === 'html') {
                            el.innerHTML = locale;
                            return 1;
                        }
                        el.setAttribute(item, locale);
                    });
                } else if (el.tagName === 'DIV') {
                    el.setAttribute('title', locale);
                } else if (['A', 'LEGEND', 'SPAN', 'LI', 'TH', 'P', 'OPTION'].indexOf(el.tagName) !== -1) {
                    el.textContent = locale;
                } else if (el.tagName === 'INPUT') {
                    el.value = locale;
                } else {
                    console.log('Tag name not found!', el.tagName);
                }
            }
        }
    };
    write_language();

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
            xhr.safe = !!obj.safe;

            mono.sendMessage({action: 'xhr', data: xhr}, function(_xhr) {
                xhr.status = _xhr.status;
                xhr.statusText = _xhr.statusText;
                xhr.response = _xhr.response;
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    return obj.success && obj.success(xhr.response);
                }
                obj.error && obj.error(xhr);
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

            if (mono.isOpera) {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState > 1 && (xhr.status === 302 || xhr.status === 0)) {
                        // Opera xhr redirect
                        if (obj.noRedirect === undefined) {
                            obj.noRedirect = 0;
                        }
                        var location = xhr.getResponseHeader('Location');
                        if (location && obj.noRedirect < 5) {
                            obj.noRedirect++;
                            var _obj = {};
                            for (var key in obj) {
                                _obj[key] = obj[key];
                            }
                            _obj.url = location;
                            delete obj.success;
                            delete obj.error;
                            var _xhr = engine.ajax(_obj);
                            xhr.abort = _xhr.abort;
                        }
                    }
                };
            }

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 ||
                    (mono.isOpera && xhr.status === 0 && xhr.response) ) {
                    var response = (obj.dataType) ? xhr.response : xhr.responseText;
                    if (obj.dataType === 'json' && typeof response !== 'object' && xhr.responseText) {
                        response = JSON.parse(xhr.responseText);
                    }
                    return obj.success && obj.success(response);
                }
                obj.error && obj.error(xhr);
            };
            xhr.onerror = function() {
                obj.error && obj.error(xhr);
            };
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

    dom_cache.body = $(document.body);
    dom_cache.search_btn = $( document.getElementById('search_btn') );
    dom_cache.search_input = $( document.getElementById('search_input') );
    dom_cache.search_clear_btn = $( document.getElementById('search_clear_btn') );

    dom_cache.search_btn.on('click', function(e) {
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
            dom_cache.search_clear_btn.hide();

            return mono.addon.postMessage('closeMe');
        }
        if (mono.isOpera) {
            mono.sendMessage({action: 'tab', url: 'build/index.html' + ( (text)?'#?search=' + text:'') });
        }
        window.close();
    });

    dom_cache.search_input.on('keypress', function(e) {
        if (e.keyCode !== 13) {
            return;
        }
        dom_cache.search_btn.trigger('click');
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
        minLength: 0,
        select: function(event, ui) {
            var $this = $(this);
            this.value = ui.item.value;
            $this.trigger('keyup');
            dom_cache.search_btn.trigger('click');
        },
        position: {
            collision: "bottom"
        },
        open: function() {
            mono.sendMessage({action: 'resize', height: 224 }, undefined, "service");
            if (mono.isOpera) {
                dom_cache.search_input.focus();
                setTimeout(function() {
                    dom_cache.search_input.focus();
                }, 100);
            }
        },
        close: function() {
            mono.sendMessage({action: 'resize', height: 70 }, undefined, "service");
            if (mono.isOpera) {
                dom_cache.search_input.focus();
                setTimeout(function() {
                    dom_cache.search_input.focus();
                }, 100);
            }
        },
        create: function() {
            var ul = document.querySelector('ul.ui-autocomplete');
            var hasTopShadow = false;
            ul.addEventListener('scroll', function(e) {
                if (this.scrollTop !== 0) {
                    if (hasTopShadow) {
                        return;
                    }
                    hasTopShadow = true;
                    this.style.boxShadow = 'rgba(0, 0, 0, 0.40) -2px 1px 2px 0px inset';
                } else {
                    if (!hasTopShadow) {
                        return;
                    }
                    hasTopShadow = false;
                    this.style.boxShadow = '';
                }
            });
        }
    });

    dom_cache.search_clear_btn.on("click", function(e) {
        e.preventDefault();
        dom_cache.search_input.val('').focus();
        $(this).hide();
    });
    dom_cache.search_input.on('input', function() {
        if (this.value.length > 0) {
            dom_cache.search_clear_btn.show();
        } else {
            dom_cache.search_clear_btn.hide();
        }
    });

    if (mono.isFF) {
        mono.onMessage(function(message) {
            if (message === 'show') {
                dom_cache.search_input.focus();
            }
        });
        dom_cache.search_input.focus();
        dom_cache.search_input.parent().parent().css('text-align', 'left');
    }
    if (mono.isOpera) {
        dom_cache.body.css({
            overflow: 'hidden'
        });
        mono.sendMessage({action: 'resize', height: 70 });
        dom_cache.search_input.focus();
        setTimeout(function() {
            dom_cache.search_input.focus();
        }, 100);
    }
    if (mono.isFF || mono.isOpera) {
        mono.onMessage(function(message) {
            if (message !== 'popupUpdate') {
                return;
            }
            mono.storage.get(['lang', 'AutoComplite_opt'],function(storage) {
                options.autoComplete = storage.AutoComplite_opt;
                _lang = get_lang(storage.lang || navigator.language.substr(0, 2));
                write_language();
            });
        });
    }
};
mono.pageId = 'popup';
mono.storage.get(['lang', 'AutoComplite_opt'],function(storage) {
    _lang = get_lang(storage.lang || navigator.language.substr(0, 2));
    if (storage.AutoComplite_opt === undefined) {
        storage.AutoComplite_opt = 1;
    }
    $(function(){
        popup(storage.AutoComplite_opt);
    });
});