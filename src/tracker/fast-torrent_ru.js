/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib['fast-torrent'] = {
    id: 'fast-torrent',
    title: 'Fast-Torrent',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////////////////////+/v7///////8AAAEAAAEAAAAAAAAAAAAAAAAAAAAFAAD///X///L///L///T///z///////////8AAAEAAAEAAAAAAAAAAAD///////8OAgD//+KgcECgb0H//+P///X///////////8AAAD////9//8AAAAAAAD///////8TAwD//9izczOzcjX//9n///L///////////8AAAD////9//8AAAAAAAAAAAAAAAAUBAD//9izczOzcjX//9n///L///////////8AAAAAAAAAAAAAAAAAAAABAQEAAAATAwD//9i3czK6cy///9H//+f///X///z///8AAAAAAAAAAAAAAAAAAAD///////8TAwD//9i6cy/IdiX//8D//9H//+L///X///8AAAD///////8AAAAAAAD///////8TAwD//9e+dCzRdiHRdx++cy6gcED///L///8AAAD///////8AAAAAAAAAAAAAAAETAwD//9i+dCzRdiHSeCC/dC+gcED///L///8AAAAAAAAAAAAAAAAAAAAAAAAAAAEUBAD//9i6cy/KdSX//8D//9H//+L///X///8AAAAAAAAAAAAAAAAAAAD9//////8TAwD//9i1czK7dDD//9H//+f///X//vv///8AAAD///////8AAAAAAAD9///+/v4TAwD//9m5czDBdSn//8j//9z//+n///D///QFAAD///////8AAAAAAAAAAAAAAAETAwD//9nBdCveeRfoehDedxbMdiSwcTf//+IOAgAAAAAAAAAAAAAAAAAAAAAAAAEOAgD//+OucjfKdiTaeBraeBrMdiSwcjb//+IOAgAAAAAAAAAAAAACAAD///////8EAQD///X//+///+n//+b//+b//+n//+7///QEAQD9//////8AAAACAAD///////8AAAD9///9//////////////////////7///4AAAD9//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    desc: 'Сайт содержит каталог фильмов, сериалов, мультфильмов и аниме.',
    flags: {
        auth: 0,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    search: {
        searchUrl: 'http://fast-torrent.ru/search/%search%/1.html',
        baseUrl: 'http://fast-torrent.ru',
        requestType: 'GET',
        onGetRequest: function(value) {
            "use strict";
            return encodeURIComponent(value);
        },
        listItemSelector: 'div.film-list>div.film-item',
        torrentSelector: {
            categoryTitle: 'div.film-wrap>div.film-genre>div',
            title: 'div.film-wrap>h2',
            url: {selector: 'div.film-wrap>.film-image a', attr: 'href'},
            date: 'div.film-foot>em:eq(2)'
        },
        onGetValue: {
            categoryTitleR: /\s+/g,
            categoryTitle: function(value) {
                "use strict";
                return value.replace(this.tracker.search.onGetValue.categoryTitleR, ' ');
            },
            dateR: /:\s(.+)/,
            date: function(value) {
                "use strict";
                var m = value.match(this.tracker.search.onGetValue.dateR);
                if (m) {
                    value = exKit.funcList.dateFormat(1, m[1]);
                }
                return value;
            }
        }
    }
};