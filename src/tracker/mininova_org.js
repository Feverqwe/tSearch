/**
 * Created by Anton on 24.05.2015.
 */
engine.trackerLib.mininova = {
    id: 'mininova',
    title: 'mininova',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AOJwNgDws5QAh0ogAPjZygDpkmYA9MmzAOaATQDsonwA++riAO6riQDyvKIA5HY/APni1gDnh1cARERERERERERBERERERERFEEREREREREUQRERERERERRBInHiLhciFEEiceIuFyIUQSJx4i4XIhRBIsHiJRciFEEiYXIjEygUQSIv0tJtKxRBiMYoVY2aFEEREREREREUQRERERERERRBERERERERFEEREREREREUREREREREREQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    desc: 'Download Movies, TV Shows, Music, Software and more. Mininova is the largest BitTorrent search engine and directory on the net with thousands of torrents.',
    flags: {
        auth: 0,
        language: 'en',
        cyrillic: 0,
        allowProxy: 1
    },
    categoryList: [
        /*Serials*/[8],
        /*Music  */[5],
        /*Games  */[3],
        /*Films  */[4],
        /*Cartoon*/[],
        /*Books  */[2],
        /*Soft   */[7],
        /*Anime  */[1],
        /*Documen*/[],
        /*Sport  */[],
        /*XXX    */[],
        /*Humor  */[]
    ],
    search: {
        searchUrl: 'http://www.mininova.org/search/',
        baseUrl: 'http://www.mininova.org/',
        requestType: 'GET',
        requestData: 'search=%search%&cat=0',
        onGetRequest: function(value) {
            "use strict";
            return encodeURIComponent(value);
        },
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
            categoryId: function(value) {
                "use strict";
                return exKit.funcList.idInCategoryListInt.call(this, value, /cat\/([d+])$/);
            },
            size: {exec: 'sizeFormat', args: [{arg: 0}]},
            date: function(value) {
                "use strict";
                value = exKit.funcList.monthReplace(value, 1);
                return exKit.funcList.dateFormat(1, value)
            }
        }
    }
};