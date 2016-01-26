/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib.katushka = {
    id: 'katushka',
    title: 'Катушка',
    icon: 'data:image/x-icon;base64,R0lGODlhEAAQAMQAAO7u7oWFhbKysqurq4GBgfr6+pqamn19fZeXl46Ojr29vZOTk5+fn4KCgoeHh6Ghob+/v5iYmIqKivDw8OPj45GRkcXFxXV1dYmJib6+vnx8fIuLi4+Pj5WVlYaGhv///yH5BAAAAAAALAAAAAAQABAAAAWa4Cd+gMJ0HaMAY5s1modhntZk7TdcW+VxHE9lcxmMMheByOLxWESCC25C2LRQrQ1hAtFUWhFEq6KBMALO5UHz/DADjIUk2IkcLBQPohPgYBZydBEaFB8OCQYYG39naW4eAUofFBtwXV8jBgQFIzsZVFaZDZwiDxosSJIWDh4DnBYXCp08PkCHHEU5LzEYEg4HBLI5JCYoKiwjIQA7',
    desc: 'Катушка, торрент трекер, торрент, torrent, кино, фильмы, музыка, софт, программы, сериалы, mp3, видео, скачать, бесплатно.',
    flags: {
        auth: 0,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: {
        serials: ['serials'],
        music: ['music', 'clips'],
        games: ['games'],
        films: ['feature', 'films'],
        cartoon: ['animated'],
        books: ['books', 'audio', 'text'],
        soft: ['soft'],
        anime: [],
        doc: ['documentary'],
        sport: ['sport'],
        xxx: ['xxx'],
        humor: []
    },
    search: {
        searchUrl: 'http://katushka.net/torrent/',
        nextPageSelector: {selector: '.torrents_list .pagination a:eq(-1)', attr: 'href'},
        baseUrl: 'http://katushka.net',
        requestType: 'GET',
        requestData: 'tags=&search=%search%&type_search=groups&incldead=0&sorting=0&type_sort=desc',
        onAfterDomParse: function (details) {
            "use strict";
            var $dom = details.$dom;
            if ($dom.find('table.data_table.torr_table>tbody>tr').length) {
                details.tracker.search.listItemSelector = details.tracker.search.listItemSelectorTable;
                details.tracker.search.torrentSelector = details.tracker.search.torrentSelectorTable;
            } else {
                details.tracker.search.listItemSelector = details.tracker.search.listItemSelectorGallery;
                details.tracker.search.torrentSelector = details.tracker.search.torrentSelectorGallery;
            }
        },
        torrentSelector: {
            categoryTitle: null,
            categoryUrl: null,
            categoryId: null,
            title: null,
            url: null,
            date: null
        },
        listItemSplice: [1, 0],
        listItemSelectorTable: 'table.data_table.torr_table>tbody>tr',
        torrentSelectorTable: {
            categoryTitle: {selector: 'td.start>a', attr: 'title'},
            categoryUrl: {selector: 'td.start>a', attr: 'href'},
            categoryId: {selector: 'td.start>a', attr: 'href'},
            title: 'td.name>div.torr_name>a:eq(1)',
            url: {selector: 'td.name>div.torr_name>a:eq(1)', attr: 'href'},
            date: 'td.name>div.date'
        },
        listItemSelectorGallery: 'div.content.after_clear>div.torr_block',
        torrentSelectorGallery: {
            categoryTitle: 'div.descr>div.tags',
            title: 'div.descr>div.torr_name>a:eq(1)',
            url: {selector: 'div.descr>div.torr_name>a:eq(1)', attr: 'href'}
        },
        onGetValue: {
            categoryId: function (details, url) {
                "use strict";
                return exKit.funcList.idInCategoryListStr(details.tracker, url, /\/([^\/]+)\/$/);
            },
            date: function (details, value) {
                "use strict";
                value = exKit.funcList.monthReplace(value);
                return exKit.funcList.dateFormat(1, value)
            }
        }
    }
};