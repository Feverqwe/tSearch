/**
 * Created by Anton on 24.05.2015.
 */
engine.trackerLib.torrentz = {
    id: 'torrentz',
    title: 'Torrentz',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZZjMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8IAAA/DcAAPw7AAD8PQAA/CAAAPw/AAD8PwAA/D8AAPw/AAD8PwAA/D8AAPw/AAB8PgAAAAAAAAAAAACAAQAA',
    desc: 'Torrent Search Engine.',
    flags: {
        auth: 0,
        language: 'en',
        cyrillic: 1,
        allowProxy: 1
    },
    search: {
        searchUrl: 'http://torrentz.eu/search',
        baseUrl: 'http://torrentz.eu/',
        requestType: 'GET',
        requestData: 'q=%search%',
        onGetRequest: 'encodeURIComponent',
        listItemSelector: 'div.results>dl',
        torrentSelector: {
            categoryTitle: {selector: 'dt', childNodeIndex: -1},
            title: 'dt>a',
            url: {selector: 'dt>a', attr: 'href'},
            size: 'dd>span.s',
            date: 'dd>span.a'
        },
        onGetValue: {
            size: function(value) {
                "use strict";
                return exKit.funcList.sizeFormat(value);
            },
            date: function(value) {
                "use strict";
                var date = new Date();
                if ((/today/).test(value)) {
                    return parseInt(Date.now() / 1000) - (date.getHours() * 60 * 60 + date.getMinutes() * 60);
                } else
                if ((/yesterday/).test(value)) {
                    return parseInt(Date.now() / 1000) - (date.getHours() * 60 * 60 + date.getMinutes() * 60 + 24 * 60 * 60);
                } else {
                    var time = value.match(/(\d+)/);
                    if (!time) {
                        return;
                    }
                    time = parseInt(time[1]);

                    var now = parseInt(Date.now() / 1000);
                    if ((/second/).test(value)) {
                        return now - time;
                    } else
                    if ((/minute/).test(value)) {
                        return now - time * 60;
                    } else
                    if ((/hour/).test(value)) {
                        return now - time * 60 * 60;
                    } else
                    if ((/day/).test(value)) {
                        return now - time * 60 * 60 * 24;
                    } else
                    if ((/week/).test(value)) {
                        return now - time * 60 * 60 * 24 * 7;
                    } else
                    if ((/month/).test(value)) {
                        return now - time * 60 * 60 * 24 * 30;
                    } else
                    if ((/year/).test(value)) {
                        return now - time * 60 * 60 * 24 * 365;
                    }
                }
                return;
            }
        }
    }
};