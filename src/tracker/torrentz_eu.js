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
        searchUrl: 'https://torrentz.eu/search',
        baseUrl: 'https://torrentz.eu/',
        requestType: 'GET',
        requestData: 'q=%search%',
        onGetRequest: function (details) {
            "use strict";
            details.request = encodeURIComponent(details.request);
        },
        listItemSelector: 'div.results>dl',
        torrentSelector: {
            categoryTitle: {selector: 'dt', childNodeIndex: -1},
            title: 'dt>a',
            url: {selector: 'dt>a', attr: 'href'},
            size: 'dd>span.s',
            date: 'dd>span.a'
        },
        onGetValue: {
            size: function (details, value) {
                "use strict";
                return exKit.funcList.sizeFormat(value);
            },
            dateR: {
                today: /today/,
                yesterday: /yesterday/,
                d: /(\d+)/,
                second: /second/,
                minute: /minute/,
                hour: /hour/,
                day: /day/,
                week: /week/,
                month: /month/,
                year: /year/
            },
            date: function (details, value) {
                "use strict";
                var rObj = details.tracker.search.onGetValue.dateR;
                var date = new Date();
                if ((rObj.today).test(value)) {
                    return parseInt(Date.now() / 1000) - (date.getHours() * 60 * 60 + date.getMinutes() * 60);
                } else if ((rObj.yesterday).test(value)) {
                    return parseInt(Date.now() / 1000) - (date.getHours() * 60 * 60 + date.getMinutes() * 60 + 24 * 60 * 60);
                } else {
                    var time = value.match(rObj.d);
                    if (!time) {
                        return;
                    }
                    time = parseInt(time[1]);

                    var now = parseInt(Date.now() / 1000);
                    if (rObj.second.test(value)) {
                        return now - time;
                    } else if (rObj.minute.test(value)) {
                        return now - time * 60;
                    } else if (rObj.hour.test(value)) {
                        return now - time * 60 * 60;
                    } else if (rObj.day.test(value)) {
                        return now - time * 60 * 60 * 24;
                    } else if (rObj.week.test(value)) {
                        return now - time * 60 * 60 * 24 * 7;
                    } else if (rObj.month.test(value)) {
                        return now - time * 60 * 60 * 24 * 30;
                    } else if (rObj.year.test(value)) {
                        return now - time * 60 * 60 * 24 * 365;
                    }
                }
                return;
            }
        }
    }
};