/**
 * Created by Anton on 02.05.2015.
 */
var explore = {
    domCache: {
        container: document.getElementById('explore_block'),
        gallery: document.getElementById('explore_gallery'),
        topSearch: document.getElementById('top_search'),
        infoPopup: document.getElementById('info_popup')
    },
    varCache: {
        isHidden: true,
        topListColumnCount: undefined
    },
    getCacheDate: function(keepAlive) {
        "use strict";
        if (!keepAlive) {
            return undefined;
        }
        var currentDate = new Date();
        var day = currentDate.getDay();
        var hours = currentDate.getHours();
        var minutes = currentDate.getMinutes();
        var seconds = currentDate.getSeconds();
        var lastDay = 0;
        keepAlive.forEach(function(num) {
            if (day >= num) {
                lastDay =  num;
            }
        });
        day = day - lastDay;
        return parseInt(currentDate.getTime() / 1000) - day*24*60*60 - hours*60*60 - minutes*60 - seconds;
    },
    writeTopList: function(content) {
        "use strict";
        if (!content || !content.length) return;

        var width = document.body.clientWidth;
        var columnCount = width > 1275 ? 4 : 3;

        var lineIcon;
        var lineIconStyle;
        var column = 1;
        var line = 1;
        var request;
        var body = mono.create('ul', {
            class: 'c' + columnCount
        });
        for (var i = 0, item; item = content[i]; i++) {
            if (line > 10) {
                break;
            }
            lineIcon = undefined;
            if (column % columnCount === 0) {
                lineIconStyle = ['info'];
                if (line < 6) {
                    lineIconStyle.push('t' + line);
                }
                lineIcon = mono.create('div', {
                    class: lineIconStyle
                });
            }
            request = item.text;
            if (item.year > 0) {
                request += ' ' + item.year;
            }
            body.appendChild(mono.create('li', {
                class: ['l'+line],
                append: [
                    lineIcon,
                    mono.create('span', {
                        title: request,
                        append: [
                            mono.create('a', {
                                href: '#?search=' + encodeURIComponent(request),
                                text: item.text
                            })
                        ]
                    })
                ]
            }));
            if (column % columnCount === 0) {
                line++;
            }
            column++;
        }

        this.domCache.topSearch.textContent = '';
        this.domCache.topSearch.appendChild(body);

        this.varCache.topListColumnCount = columnCount;
    },
    loadTopList: function() {
        "use strict";
        var cache = engine.topList;
        var date = this.getCacheDate([0,1,2,3,4,5,6]);
        if (cache.keepAlive === date || !navigator.onLine) {
            return this.writeTopList(cache.content);
        }

        mono.ajax({
            url: "http://static.tms.mooo.com/top.json",
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (data && data.keywords) {
                    (cache.content = data.keywords).sort(function(a, b) {
                        if (a.weight === b.weight) {
                            return 0;
                        } else
                        if (a.weight > b.weight) {
                            return -1;
                        }
                        return 1;
                    });

                    cache.keepAlive = date;
                    mono.storage.set({topList: cache});
                }

                this.writeTopList(cache.content);
            }.bind(this),
            error: function() {
                this.writeTopList(cache.content);
            }.bind(this)
        });
    },
    show: function() {
        "use strict";
        if (!this.varCache.isHidden) return;
        this.varCache.isHidden = true;

        this.once();
        this.domCache.container.classList.remove('hide');
    },
    hide: function() {
        "use strict";
        if (this.varCache.isHidden) return;
        this.varCache.isHidden = false;

        this.domCache.container.classList.add('hide');
    },
    once: function once() {
        "use strict";
        if (once.inited) return;
        once.inited = 1;

        if (!engine.settings.hideTopSearch) {
            this.loadTopList();
        }
    }
};