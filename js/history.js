var view = function() {
    "use strict";
    var dom_cache = {};
    var var_cache = {
        history: [],
        click_history: {},
        window_scroll_timer: undefined
    };
    var onsort = function(a,b) {
        if (a.time === b.time) {
            return 0;
        } else if (a.time > b.time) {
            return -1;
        } else {
            return 1;
        }
    };
    var writeHistory = function() {
        if (var_cache.history.length === 0) {
            dom_cache.history.append($('<center>', {text: _lang.his_no_his}));
            return;
        }
        var content = [];
        var_cache.history.sort(onsort);
        var_cache.history.forEach(function(item) {
            var trackers = '';
            var trackers_dom = [];
            if (item.trackers !== undefined && item.trackers.length > 0) {
                trackers = '&tracker='+JSON.stringify(item.trackers);
                item.trackers_names.forEach(function(item) {
                    trackers_dom.push( $('<span>', {'class': 'tracker', text: item}) );
                });
            }
            content.push(
                $('<li>').append(
                    $('<div>', {'class': 'remove', title: _lang.his_rm_btn}).data('title',item.title),
                    $('<div>', {'class': 'time', title: u2ddmmyyyy_title(item.time), text: u2ddmmyyyy_title(item.time)}),
                    $('<div>', {'class': 'title'}).append(
                        $('<a>', {text: item.title, href:'index.html#?search='+item.title+trackers})
                    ),
                    trackers_dom
                )
            );
        });
        dom_cache.history.empty().append( content );
    };
    var checkTitle = function(title) {
        if (var_cache.angleRegExp === undefined) {
            var_cache.angleRegExp = new RegExp('<(\\/?)([^>]*)>', 'g');
        }
        title = title.replace(var_cache.angleRegExp, function(str, bSlash, tagName) {
            if (tagName !== 'b' && tagName.substr(0, 4) !== 'span') {
                return '&lt;'+bSlash+tagName+'&gt;'
            }
            return '<'+bSlash+tagName+'>';
        });
        return title;
    };
    var writeClickHistory = function() {
        var content = [];
        $.each(var_cache.click_history, function(request, items) {
            var items_dom = [];
            items.sort(onsort);
            items.forEach(function(item){
                var title = checkTitle(item.title);
                items_dom.push( $('<li>').append(
                    $('<div>', {'class': 'remove', title: _lang.his_rm_btn}).data('title',title).data('request',request),
                    $('<div>', {'class': 'time', title: u2ddmmyyyy_title(item.time), text: u2ddmmyyyy_title(item.time)}),
                    $('<div>', {'class': 'title'}).append(
                        $('<a>',{href: item.href, target: '_blank'}).data('request',request).data('href', item.href).html(title)
                    )
                ));
            });
            content.push($('<li>').append(
                $('<div>', {'class': 'icon'}),
                $('<a>',{text: (request.length === 0)?'""':request, href:'index.html#?search='+request}),
                $('<ol>',{'class': 'items'}).append(items_dom)
            ));
        });
        dom_cache.click_history.empty().append(content);
    };
    var removeItem = function(request, title) {
        var index, i, item;
        if (request === undefined) {
            for (i = 0; item = var_cache.history[i]; i++) {
                if (title === item.title) {
                    index = i;
                    break;
                }
            }
            if (index === undefined) {
                return;
            }
            var_cache.history.splice(index,1);
            mono.storage.set({history: var_cache.history});
            //writeHistory();
            return;
        }
        var list = var_cache.click_history[request];
        if (list === undefined) {
            return;
        }
        var list_len = list.length;
        if (list_len === 1) {
            delete var_cache.click_history[request];
            mono.storage.set({click_history: JSON.stringify(var_cache.click_history)});
            //writeClickHistory();
            return;
        }
        for (i = 0; item = list[i]; i++) {
            if (title === item.title) {
                index = i;
                break;
            }
        }
        if (index === undefined) {
            return;
        }
        list.splice(index,1);
        mono.storage.set({click_history: JSON.stringify(var_cache.click_history)});
        //writeClickHistory();
    };
    var u2ddmmyyyy = function(shtamp) {
        //преврящает TimeShtamp в строчку
        var time = new Date(shtamp * 1000);
        var month = time.getMonth() + 1;
        if (month < 10) {
            month = '0'+month;
        }
        var date = time.getDate();
        if (date < 10) {
            date = '0'+date;
        }
        var hours = time.getHours();
        var minutes = time.getMinutes();
        if (hours < 10) {
            hours = '0'+hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        return date + '.' + month + '.' + time.getFullYear() + ' ' + hours+':'+minutes;
    };
    var u2ddmmyyyy_title = function(i) {
        if (i <= 0) {
            return '∞';
        }
        return u2ddmmyyyy(i);
    };
    var write_language = function() {
        $('head > title').text(_lang.his_title);
        $('h1').text(_lang.his_h1);
        $('a.button.main').attr('title',_lang.btn_main);
        dom_cache.topbtn.attr('title',_lang.btn_up);
    };
    return {
        begin: function() {
            dom_cache.window = $(window);
            dom_cache.body = $('body');
            dom_cache.topbtn = $('div.topbtn');
            dom_cache.history = $('ol.history');
            dom_cache.click_history = $('ol.click_history');
            dom_cache.html_body = $('html, body');
            write_language();
            dom_cache.window.on('scroll',function() {
                clearTimeout(var_cache.window_scroll_timer);
                var_cache.window_scroll_timer = setTimeout(function() {
                    if (dom_cache.window.scrollTop() > 100) {
                        dom_cache.topbtn.fadeIn('fast');
                    } else {
                        dom_cache.topbtn.fadeOut('fast');
                    }
                }, 250);
            });
            dom_cache.topbtn.on("click", function(e) {
                e.preventDefault();
                window.scrollTo(window.scrollX, 200);
                dom_cache.html_body.animate({
                    scrollTop: 0
                }, 200);
            });
            mono.storage.get(['history', 'click_history'], function(storage){

                if (typeof storage.history === 'string') {
                    try {
                        storage.history = JSON.parse(storage.history);
                    } catch (e) {
                        storage.history = undefined;
                    }
                }

                var_cache.history = storage.history || [];
                try {
                    var_cache.click_history = JSON.parse(storage.click_history || '{}');
                } catch (e) {
                    var_cache.click_history = {};
                }
                writeHistory();
                writeClickHistory();
            });
            dom_cache.body.on('click', 'div.remove', function(e){
                e.preventDefault();
                var $this = $(this);
                var li = $this.parent();
                li.hide();
                var request = $this.data('request');
                if (request !== undefined) {
                    var ol = li.parent();
                    if (ol.children('li:visible').length === 0) {
                        ol.parent().hide();
                    }
                }
                removeItem(request, $this.data('title'));
            });
            dom_cache.body.on('click', 'ol.click_history div.title > a', function(){
                var $this = $(this);
                var request = $this.data('request');
                var href = $this.data('href');
                if (request === undefined || href === undefined) {
                    return;
                }
                var click_history = var_cache.click_history[request];
                for (var i = 0, item; item = click_history[i]; i++) {
                    if (item.href === href) {
                        item.count += 1;
                        item.time = parseInt(Date.now() / 1000);
                        break;
                    }
                }
                var new_obj = {};
                new_obj[request] = click_history;
                $.each(var_cache.click_history, function(key, value) {
                    if (key !== request) {
                        new_obj[key] = value;
                    }
                });
                var_cache.click_history = new_obj;
                mono.storage.set({click_history: JSON.stringify(new_obj)});
            });
            $('div.content').removeClass('loading');
        }
    };
}();

var loadLanguage = function(cb, force) {
    var url = '_locales/{lang}/messages.json';
    var lang;
    if (mono.isChrome) {
        lang = chrome.i18n.getMessage('lang');
    } else {
        lang = navigator.language.substr(0, 2);
    }

    url = url.replace('{lang}', force || lang);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var data = xhr.response;
        window._lang = {};
        for (var item in data) {
            window._lang[item] = data[item].message;
        }
        cb();
    };
    xhr.onerror = function() {
        if (force) {
            return cb();
        }
        loadLanguage(cb, 'en');
    };
    try {
        xhr.send();
    } catch (e) {
        xhr.onerror();
    }
};

mono.pageId = 'tab';
loadLanguage(function() {
    $(function () {
        view.begin();
    });
});