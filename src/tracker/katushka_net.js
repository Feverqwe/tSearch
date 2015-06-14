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
    categoryList: [
        /*Serials*/['serials'],
        /*Music  */['music', 'clips'],
        /*Games  */['games'],
        /*Films  */['feature', 'films'],
        /*Cartoon*/['animated'],
        /*Books  */['books', 'audio', 'text'],
        /*Soft   */['soft'],
        /*Anime  */[],
        /*Documen*/['documentary'],
        /*Sport  */['sport'],
        /*XXX    */['xxx'],
        /*Humor  */[]
    ],
    search: {
        searchUrl: 'http://katushka.net/torrent/',
        baseUrl: 'http://katushka.net',
        requestType: 'GET',
        requestData: 'tags=&search=%search%&type_search=groups&incldead=0&sorting=0&type_sort=desc',
        onGetRequest: 'encodeURIComponent',
        onAfterDomParse: function() {
            "use strict";
            var $dom = this.tracker.env.$dom;
            if ($dom.find('table.data_table.torr_table>tbody>tr').length) {
                this.tracker.search.listItemSelector = this.tracker.search.listItemSelectorTable;
                this.tracker.search.torrentSelector = this.tracker.search.torrentSelectorTable;
            } else {
                this.tracker.search.listItemSelector = this.tracker.search.listItemSelectorGallery;
                this.tracker.search.torrentSelector = this.tracker.search.torrentSelectorGallery;
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
            url: {selector: 'div.descr>div.torr_name>a:eq(1)', attr: 'href'},
            date: 'div.descr>div.date'
        },
        onGetValue: {
            categoryId: {exec: 'idInCategoryListStr', args: [{arg: 0}, {regexp: '\\/([^\\/]+)\\/$'}]},
            date: function(value) {
                "use strict";
                value = exKit.funcList.monthReplace(value);
                return exKit.funcList.dateFormat(1, value)
            }
        }
    }
};