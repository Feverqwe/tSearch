/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib.kickass = {
    id: 'kickass',
    title: 'KickAss',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHUFLcyFLV74bO0UuAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeQEthLmNy+DVzhf81c4X/NXOF/ydUYdscPEUdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkTFeuN3WG/zh2iP84doj/OHaI/zh2iP84doj/M2t7/B9BS1IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlS1ecPHmM/zx5jP88eYz/WIyc/3OfrP9BfI//PHmM/zx5jP83b4D9IEFLPgAAAAAAAAAAAAAAAAAAAAAiQ0wzPXiJ/kB9j/9AfY//XZGg//b5+v//////4uvu/2iZp/9AfY//QH2P/zNkcu4AAAAAAAAAAAAAAAAAAAAAMl1q2UWBlP9FgZT/RYGU/73T2f///////f7+//L29//p8PL/RYGU/0WBlP9FgZT/KUxXgAAAAAAAAAAAJ0ZPHUeBk/9Khpj/SoaY/0qGmP/b5+r//////7vR2P9Khpj/bp6t/0qGmP9Khpj/SoaY/zlndOcAAAAAAAAAAC9SXIBPi53/T4ud/0+Lnf9Pi53/0eHm///////F2d//T4ud/0+Lnf9Pi53/T4ud/0+Lnf9Mhpf/KEZPEgAAAAA4YGu+VJCh/1SQof9UkKH/VJCh/8HX3f//////6/L0/1SQof9UkKH/VJCh/1SQof9UkKH/VJCh/y9QWVwAAAAAQGp31lmUpv9ZlKb/aZ6u/5u/yv/W5en////////////C2N//3urt/3Smtf9ZlKb/WZSm/1mUpv81WWOIAAAAAENseNRemar/Xpmq/3Wntv////////////////////////////////+VvMf/Xpmq/16Zqv9emar/OFtlhAAAAABCaHS+Y52v/2Odr/9nn7H/iLTC/4Kxv//0+Pn//////6zL1f9jna//Y52v/2Odr/9jna//Y52v/zdXYVwAAAAAPF5od2ehsv9nobL/Z6Gy/2ehsv9nobL/xtzi///////f6+//Z6Gy/2ehsv9nobL/Z6Gy/2Wdrv80UVoSAAAAADZTXBJkmqr+a6W2/2ultv9rpbb/a6W2/2ultv9rpbb/a6W2/2ultv9rpbb/a6W2/2ultv9SfovlAAAAAAAAAAAAAAAAS3J9xG+ouf9vqLn/XIuZ9GGTovpvqLn/b6i5/2+ouf9gkqD5Zpqp/W+ouf9vqLn/QWJsdwAAAAAAAAAAAAAAADtZYhdbipfxQWJrbgAAAAAAAAAAR2t2p2CRn/dBYmtuAAAAAAAAAABGanSgVH6L3wAAAAAAAAAA/j8AAPgPAADwBwAA4AMAAMADAADAAQAAgAEAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIABAADAAQAAxjMAAA%3D%3D',
    desc: 'Search and download new TV shows, TV series, movies, mp3, music and PC/PS2/PSP/Wii/Xbox games absolutely for free.',
    flags: {
        auth: 0,
        language: 'en',
        cyrillic: 0,
        allowProxy: 1
    },
    categoryList: [
        /*Serials*/[],
        /*Music  */['music'],
        /*Games  */[],
        /*Films  */['movies', 'tv'],
        /*Cartoon*/[],
        /*Books  */['books'],
        /*Soft   */['applications'],
        /*Anime  */['anime'],
        /*Documen*/[],
        /*Sport  */[],
        /*XXX    */['xxx'],
        /*Humor  */[]
    ],
    search: {
        searchUrl: 'http://kat.cr/search/%search%/',
        wordUrl: 'http://kat.cr/search/%search%/',
        blankUrl: 'http://kat.cr/new/',
        baseUrl: 'http://kat.cr/',
        requestType: 'GET',
        onGetRequest: function(value) {
            "use strict";
            if (!value) {
                this.tracker.search.searchUrl = this.tracker.search.blankUrl;
            } else {
                this.tracker.search.searchUrl = this.tracker.search.wordUrl;
                value = encodeURIComponent(value);
            }
            return value;
        },
        listItemSelector: '#mainSearchTable table tbody>tr',
        listItemSplice: [1, 0],
        torrentSelector: {
            categoryTitle: 'td:eq(0) span[id]',
            categoryUrl: {selector: 'td:eq(0) span[id] a', attr: 'href'},
            categoryId: {selector: 'td:eq(0) span[id] a', attr: 'href'},
            title: 'a.cellMainLink',
            url: {selector: 'a.cellMainLink', attr: 'href'},
            size: 'td.nobr.center',
            seed: 'td.green.center',
            peer: 'td.red.lasttd.center'
        },
        onGetValue: {
            categoryId: {exec: 'idInCategoryListStr', args: [{arg: 0}, {regexp: '\\/([^\\/]+)\\/$'}]},
            size: function(value) {
                "use strict";
                return exKit.funcList.sizeFormat(value)
            }
        }
    }
};