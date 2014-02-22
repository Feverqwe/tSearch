var view = function() {
    var dom_cache = {};
    var var_cache = {
        history: JSON.parse(GetSettings('history') || '[]'),
        click_history: JSON.parse(GetSettings('click_history') || '{}'),
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
    var writeClickHistory = function() {
        var content = [];
        $.each(var_cache.click_history, function(request, items) {
            var items_dom = [];
            items.sort(onsort);
            items.forEach(function(item){
                items_dom.push( $('<li>').append(
                    $('<div>', {'class': 'remove', title: _lang.his_rm_btn}).data('title',item.title).data('request',request),
                    $('<div>', {'class': 'time', title: u2ddmmyyyy_title(item.time), text: u2ddmmyyyy_title(item.time)}),
                    $('<div>', {'class': 'title'}).append(
                        $('<a>',{href: item.href, target: '_blank'}).html(item.title)
                    )
                ));
            });
            content.push($('<li>').append(
                $('<div>', {'class': 'icon'}),
                $('<a>',{text: (request.length === 0)?'""':request, href:'index.html#?search='+request}), $('<ol>',{'class': 'items'}).append(items_dom)
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
            SetSettings('history', JSON.stringify(var_cache.history));
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
            SetSettings('click_history', JSON.stringify(var_cache.click_history));
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
        SetSettings('click_history', JSON.stringify(var_cache.click_history));
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
            writeHistory();
            writeClickHistory();
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
            $('div.content').removeClass('loading');
        }
    };
}();
$(function() {
    view.begin();
});