/**
 * Created by Anton on 07.04.2015.
 */
var view = {
    domCache: {
        historyList: document.getElementById('history_list')
    },
    timeStampToDate: function(seconds, format) {
        "use strict";
        format = format || mono.language.dateFormat;
        var _date = new Date(seconds * 1000);
        var month = _date.getMonth() + 1;
        var date = _date.getDate();
        if (month < 10) {
            month = '0'+month;
        }
        if (date < 10) {
            date = '0'+date;
        }
        var hour = _date.getHours();
        if (hour < 10) {
            hour = '0'+hour;
        }
        var minutes = _date.getMinutes();
        if (minutes < 10) {
            minutes = '0'+minutes;
        }

        var list = {'MM': month, 'DD': date, 'YYYY': _date.getFullYear(), 'hh': hour, 'mm': minutes};
        for (var key in list) {
            format = format.replace(key, list[key]);
        }
        return format;
    },
    delRequest: function(index) {
        "use strict";
        engine.history.splice(index, 1);
        mono.storage.set({searchHistory: engine.history});
    },
    delLink: function (linkIndex, index) {
        "use strict";
        if (engine.history[index] === undefined) {
            return;
        }
        engine.history[index].linkList.splice(linkIndex, 1);
        mono.storage.set({searchHistory: engine.history});
    },
    writeHistory: function () {
        "use strict";
        view.domCache.historyList.textContent = '';
        mono.create(view.domCache.historyList, {
            append: (function() {
                var list = [];
                for (var i = 0, historyObj; historyObj = engine.history[i]; i++) {
                    list.push(mono.create('div', {
                        class: 'requestItem',
                        data: {
                            index: i
                        },
                        append: (function(){
                            var list = [];
                            for (var i = 0, linkObj; linkObj = historyObj.linkList[i]; i++) {
                                list.push(mono.create('div', {
                                    class: 'link title',
                                    data: {
                                        index: i
                                    },
                                    append: [
                                        mono.create('i', {
                                            class: 'icon del'
                                        }),
                                        mono.create('span', {
                                            class: 'date',
                                            text: view.timeStampToDate(linkObj.clickTime, mono.language.dateFormat + ' hh:mm')
                                        }),
                                        mono.create('a', {
                                            text: linkObj.title,
                                            href: linkObj.url,
                                            target: '_blank'
                                        })
                                    ]
                                }));
                            }
                            return [
                                mono.create('div', {
                                    class: 'request title',
                                    append: [
                                        mono.create('i', {
                                            class: 'icon del'
                                        }),
                                        mono.create('a', {
                                            text: (!historyObj.request) ? '""' : historyObj.request,
                                            href: 'index.html#?' + mono.param({
                                                search: historyObj.request,
                                                params: JSON.stringify({
                                                    profileName: historyObj.profileName,
                                                    trackerList: historyObj.trackerList
                                                })
                                            })
                                        })
                                    ]
                                }),
                                mono.create('div', {
                                    class: 'linkList',
                                    append: list
                                })
                            ];
                        })()
                    }));
                }
                return list;
            })()
        })
    },
    once: function () {
        "use strict";
        mono.writeLanguage(mono.language);
        view.domCache.historyList.addEventListener('click', function(e) {
            var el = e.target;
            if (!el.classList.contains('del')) {
                return;
            }
            e.preventDefault();

            var item = el.parentNode;
            while (!el.classList.contains('requestItem')) {
                el = el.parentNode;
            }
            var historyObjIndex = el.dataset.index;
            if (item.classList.contains('request')) {
                view.delRequest(historyObjIndex);
            } else {
                var itemIndex = item.dataset.index;
                view.delLink(itemIndex, historyObjIndex);
            }

            view.writeHistory();
        });
        document.body.classList.remove('loading');
        view.writeHistory();
    }
};
engine.init(function() {
    "use strict";
    view.once();
});