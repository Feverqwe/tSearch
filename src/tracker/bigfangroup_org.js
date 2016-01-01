/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib['bigfangroup'] = {
    id: 'bigfangroup',
    title: 'BigFanGroup',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS4xLjIiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxMy0wNC0wNFQxNDowNDo5MDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UGl4ZWxtYXRvciAyLjEuMTwveG1wOkNyZWF0b3JUb29sPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6Q29tcHJlc3Npb24+NTwvdGlmZjpDb21wcmVzc2lvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MTwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNjwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE2PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CvJlu/AAAANqSURBVDgRbZNtbFNlFMf/97Z3652jtWvHHSvtWLd1L0HDmARCN2FApeBswI1MJZAsRo3Eb2qmfBnGTybGRT9IDAYNBgSyZBKYZJZlwRlQM7Tb6kLJXnR920u79eXe3d3b2/vYSpagcj6cc/L8n995zvPkPBQhBI+1SXeJpMVpjYYRtQn2YzRdTT5uH/XvApQG8c7tINmO0LzUPjCkVjEMhbZWKrCxBH0QNX2o/G4Mj0AUWTpTDna2HpTiXExsco1PrDxzfVDWXR1UMC/lumMycGwk8OxmsKdJK+xoLBzlDOEhKPKPQqzqPkWUCzHvUMDk9QYwGRAwMFyM1uZZOJ0J9HltuC9wgCBjW8kCXM4lzAU3gzObcexoAWluMARApLPk5a63yXbn0+RafzG59G0ZicUY4vu9iEw90JHy2udJ9/u1JJXUkOBcAVmcB9mzr5Gceus4IdFXEzTS/j+tFhH+qA3nL9fBtX8ZFy5WYNvOI9AVqXjjlSlIYgHu/aZH3W4Puj98CpNRDhaLAiiijxYTwZ+tpSnILINrd2sxPl4MU8ka2l+cAlEJrg9ZoWoo8GkaQpbBV8P1WFI2oIKTASLfoVUpNeDYnAClasAUCzAasnA/F0fvRz4srxRibNwER00KzS08fu3vh6dxOneyBpXcGrKiNEILCfZujW1NKDcQZEQWaYHCje/NaHr2IMwmGZ2eaYTnWMzMFOLTz+sxE9HDXqbCxinLkb/Wxuiz3p2znBE/Hd1FUKOPIZnM4kq/FUsrRsRjDJy74uB5CqFQAS7e3gp/yISTbhWcifJaXT9EtD09PWp0ZGvviYO0q6w0SO9tTSMcDcO9LwJH7SqOv1YNz+Eg9PoMoJVgyV2xq10nYzXem59MOu82tfgH7aWL56vLq3Hi5A5U2VM40jaP02ccmFgwYyGuxfBtI4p4Huc+sMBWpn7BNIz+kme1eZc33y3fO+4X2C2x5YoDh1+yQzHkXnkDA2aLjC8Ha8AkFVz6zI5DLfxNPJh6D6aH3D8d5NMD3SQZ/gOdrx9LXLn1TQrOhpwkqshEstjfwOLOjTZ0dFRchkQ60TS6+hAH/vOZcgsUKHna1ZXOUO/eHGHqtLkZaDtUOfHEk/WfQHfq63VwPf6vwLqwcs9lYI14k6hZiQ/5z5XuXeTXtUfj35VGeoV6xszZAAAAAElFTkSuQmCC',
    desc: 'Bigfangroup.org - только у нас можно скачать самые новые серии Интернов, новые выпуски Comedy Club. Новые серии сериала Деффчёнки, новые фильмы, сериалы, музыку и игры для компьютера бесплатно, без смс, на большой скорости.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: {
        serials: [11],
        music: [44, 46, 43],
        games: [5],
        films: [13, 48, 45, 33, 39, 15, 21, 28, 18, 24, 36, 19, 31, 12, 29, 27, 47, 22],
        cartoon: [],
        books: [35, 38],
        soft: [1],
        anime: [],
        doc: [32, 49, 25, 26, 23, 30, 14],
        sport: [37],
        xxx: [42],
        humor: []
    },
    search: {
        searchUrl: 'http://www.bigfangroup.org/browse.php',
        baseUrl: 'http://www.bigfangroup.org/',
        requestType: 'GET',
        requestData: 'search=%search%',
        onGetRequest: function (value) {
            "use strict";
            return exKit.funcList.encodeCp1251(value);
        },
        listItemSelector: '#highlighted>tr',
        torrentSelector: {
            categoryTitle: {selector: 'td:eq(0)>a img', attr: 'title'},
            categoryUrl: {selector: 'td:eq(0)>a', attr: 'href'},
            categoryId: {selector: 'td:eq(0)>a', attr: 'href'},
            title: 'td.indented:eq(0)>a',
            url: {selector: 'td.indented:eq(0)>a', attr: 'href'},
            size: 'td:eq(5)',
            downloadUrl: {selector: 'td.indented:eq(1)>a', attr: 'href'},
            seed: 'td:eq(6)',
            peer: 'td:eq(7)',
            date: {selector: 'td:eq(3)>img:eq(-1)', attr: 'title'}
        },
        onGetValue: {
            categoryId: function (value) {
                "use strict";
                return exKit.funcList.idInCategoryListInt(this, value, /cat=([0-9]+)/);
            },
            date: function (value) {
                "use strict";
                value = exKit.funcList.monthReplace(value);
                return exKit.funcList.dateFormat(1, value)
            },
            size: function (value) {
                "use strict";
                return exKit.funcList.sizeFormat(value)
            }
        },
        onSelectorIsNotFound: {
            downloadUrl: function () {
                "use strict";
                this.env.skipSelector = true;
            }
        }
    }
};