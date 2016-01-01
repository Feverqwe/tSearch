/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib['bitsnoop'] = {
    id: 'bitsnoop',
    title: 'BitSnoop',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAN5SQADG6tQA0pKAAM6ikADt4dgAuy8UAMrWwADWgmwA8c3EAO3d1ADKvqwAwwLoAM6qlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBgYGBgYGBgYGBgYAAAAGBgYGBgYGBgYGBgYGBgAGBgYGBgYGBgYGBgYGBgYGBgYGBgwBCQkJCQEMBgYGBgYGBgwFCQkJCQkJBQwGBgYGBgYBCQkFDQgKCQkBBgYGBgYGCQkJAwIJCQkJCQYGBgYGBgkJCQcCCQkJCQkGBgYGBgYJCQkHBgIECQkJBgYGBgYGCQkJAwYGAwkJCQYGBgYGBgEJCQULCwUJCQEGBgYGBgYMBQkJCQkJCQUMBgYGBgYGBgwBCQkJCQEMBgYGBgYGBgYGBgYGBgYGBgYGBgYABgYGBgYGBgYGBgYGBgYAAAAGBgYGBgYGBgYGBgYAAMADAACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAMADAAA%3D',
    desc: 'The best torrent search in the world. Aggregated torrents from numerous sites and groups, automated verification, super-fast search.',
    flags: {
        auth: 0,
        language: 'en',
        cyrillic: 1
    },
    categoryList: {
        serials: ['tv'],
        music: ['audio'],
        games: ['games', 'game_pc', 'xbox'],
        films: ['video'],
        cartoon: [],
        books: ['books', 'abooks'],
        soft: ['software'],
        anime: [],
        doc: [],
        sport: [],
        xxx: [],
        humor: ['x3']
    },
    search: {
        searchUrl: 'http://bitsnoop.com/search/all/%search%/c/d/1/',
        baseUrl: 'http://bitsnoop.com',
        requestType: 'GET',
        onGetRequest: function (value) {
            "use strict";
            return encodeURIComponent(value);
        },
        listItemSelector: '#torrents>li',
        torrentSelector: {
            categoryTitle: {selector: '>span.icon', attr: 'title'},
            categoryId: {selector: '>span.icon', attr: 'class'},
            title: 'a',
            url: {selector: 'a', attr: 'href'},
            size: {selector: 'table>tbody>tr>td:eq(0)', childNodeIndex: 0},
            seed: 'div.torInfo>span.seeders',
            peer: 'div.torInfo>span.leechers'
        },
        onGetValue: {
            categoryId: function (url) {
                "use strict";
                return exKit.funcList.idInCategoryListStr(this, url, /icon cat_(.+)/);
            },
            size: function (value) {
                "use strict";
                return exKit.funcList.sizeFormat(value)
            }
        }
    }
};