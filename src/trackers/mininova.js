// ==UserScript==
// @name Mininova
// @trackerURL http://mininova.org
// @icon data:image/x-icon;base64,AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AOJwNgDws5QAh0ogAPjZygDpkmYA9MmzAOaATQDsonwA++riAO6riQDyvKIA5HY/APni1gDnh1cARERERERERERBERERERERFEEREREREREUQRERERERERRBInHiLhciFEEiceIuFyIUQSJx4i4XIhRBIsHiJRciFEEiYXIjEygUQSIv0tJtKxRBiMYoVY2aFEEREREREREUQRERERERERRBERERERERFEEREREREREUREREREREREQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
// @description Download Movies, TV Shows, Music, Software and more. Mininova is the largest BitTorrent search engine and directory on the net with thousands of torrents.
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/mininova.js
// @connect *://*.mininova.org/*
// @require exKit
// @version 1.0.1
// ==/UserScript==

API_exKit({
    id: 'mininova',
    title: 'Mininova',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AOJwNgDws5QAh0ogAPjZygDpkmYA9MmzAOaATQDsonwA++riAO6riQDyvKIA5HY/APni1gDnh1cARERERERERERBERERERERFEEREREREREUQRERERERERRBInHiLhciFEEiceIuFyIUQSJx4i4XIhRBIsHiJRciFEEiYXIjEygUQSIv0tJtKxRBiMYoVY2aFEEREREREREUQRERERERERRBERERERERFEEREREREREUREREREREREQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    desc: 'Download Movies, TV Shows, Music, Software and more. Mininova is the largest BitTorrent search engine and directory on the net with thousands of torrents.',
    flags: {
        auth: 0,
        language: 'en',
        cyrillic: 0
    },
    categoryList: {
        serials: [8],
        music: [5],
        games: [3],
        films: [4],
        cartoon: [],
        books: [2],
        soft: [7],
        anime: [1],
        doc: [],
        sport: [],
        xxx: [],
        humor: []
    },
    search: {
        searchUrl: 'http://www.mininova.org/search/',
        nextPageSelector: {selector: '#pagination ul li:eq(-1) a', attr: 'href'},
        baseUrl: 'http://www.mininova.org/',
        requestType: 'GET',
        requestData: 'search=%search%&cat=0',
        listItemSelector: 'table.maintable>tbody>tr',
        listItemSplice: [1, 0],
        torrentSelector: {
            categoryTitle: 'td:eq(1)>a',
            categoryUrl: {selector: 'td:eq(1)>a', attr: 'href'},
            categoryId: {selector: 'td:eq(1)>a', attr: 'href'},
            title: 'td:eq(2)>a:eq(-1)',
            url: {selector: 'td:eq(2)>a:eq(-1)', attr: 'href'},
            size: 'td:eq(3)',
            downloadUrl: {selector: 'td:eq(2)>a:eq(1)', attr: 'href'},
            seed: 'td:eq(4)',
            peer: 'td:eq(5)',
            date: 'td:eq(0)'
        },
        onGetValue: {
            categoryId: function (details, value) {
                return exKit.funcList.idInCategoryListInt(details.tracker, value, /cat\/([d+])$/);
            },
            size: function (details, value) {
                return exKit.funcList.sizeFormat(value)
            },
            date: function (details, value) {
                value = exKit.funcList.monthReplace(value, 1);
                return exKit.funcList.dateFormat(1, value)
            }
        }
    }
});