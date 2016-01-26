/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib.btdigg = {
    id: 'btdigg',
    title: 'BTDigg',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS4xLjIiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxMi0xMS0yOFQxMDoxMTowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UGl4ZWxtYXRvciAyLjEuMTwveG1wOkNyZWF0b3JUb29sPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6Q29tcHJlc3Npb24+NTwvdGlmZjpDb21wcmVzc2lvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MTwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNjwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE2PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Clkt1JIAAAI8SURBVDgRjVO/a1NRGD3ffS+/OiVItZpNhKKkIo4WpSLipIIdxC4OOokuRWxThZKiJIUMXZx0cTLQwR8I0r+gOIilqYuTTqURi6Fom/fue5/n5tESQWw+eD/vd849595zRVXRW7WmFDoewkyEYQjGyyU8qjXxYOcH6rNjant73bvZ/bEI8dy7AOeyFs+MwVl+ThBc5/N2Ko/S/KosPPkiRde3W7KroLoiowTdVIOWgTykMCsGvpcCog6U9JuR1XbH4lLa4FBwCsuz0LhLUP0kgzEw4PtY9jNyOAoS/l53hvpii23j62YUYWl6RG+5Lt/dOPOk8XENkeQduBfoxl3FEe0Z5IwnxTjSVm1NrtPqkql8lSxiNCjygEkh9y9wQpEQ25ATejJNzFXbQmiyW7hPHW9FkafEfYuL7NRYKD6GQyh5VybxIQhwxM/KGSezn6Jlo4JhwwSYX9uocIXHI0rrt2iVMvCmEGLGO38HP8XiO4xcYAicwn0rjgkHijse1Axs4TPjNEJZfYHddrLanPTyQA5PTZBGmgvyKop1LkVp8h8abiOYgd9GdIOBu3HvmHb2kji/Js/ZcFGtDLrt7N0RR+pOjM8JwkDXrWKUPTszx3W9exYqjEgc4EVgMabQdXZv0FDsZ7rhccGyTlgQ6Byf7zzBkAM7L3sK3Ed9VQ6y8y7PXINeX3NtFkk2wWuBw6eZl8bUCX2fGE0i9xeBI3FFRX6miXL5JB5XV1Ah2cvtDr5lC0hNHdV20pXc/wBs5uU1+j7hpAAAAABJRU5ErkJggg%3D%3D',
    desc: 'Это поисковая система по сети BitTorrent DHT, которая анализирует сеть и предоставляет полнотекстовый поиск по активным торрентам.',
    flags: {
        auth: 0,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    search: {
        searchUrl: 'http://btdigg.org/search',
        nextPageSelector: {selector: 'table.pager a:eq(-1)', attr: 'href'},
        baseUrl: 'http://btdigg.org',
        requestType: 'GET',
        requestData: '%search%&p=0&order=0',
        onAfterRequest: function (details) {
            "use strict";
            details.tracker.lastResponseUrl = details.responseURL;
        },
        onBeforeRequest: function (details) {
            "use strict";
            var value = details.query;
            var infoHash = '';
            var q = encodeURIComponent(value);
            if (value.length === 40 && /^[a-zA-Z0-9]+$/.test(value)) {
                infoHash = value;
            }
            details.query = 'info_hash=' + infoHash + '&q=' + q;
        },
        onAfterDomParse: function (details) {
            "use strict";
            var $dom = details.$dom;
            if ($dom.find('#torrent_info').length) {
                details.tracker.search.listItemSelector = details.tracker.search.listItemSelectorHash;
                details.tracker.search.torrentSelector = details.tracker.search.torrentSelectorHash;
            } else {
                details.tracker.search.listItemSelector = details.tracker.search.listItemSelectorText;
                details.tracker.search.torrentSelector = details.tracker.search.torrentSelectorText;
            }
        },
        torrentSelector: {
            title: null,
            url: null,
            size: null,
            downloadUrl: null,
            date: null
        },
        listItemSelectorText: '#search_res>table>tbody>tr',
        torrentSelectorText: {
            title: 'tr>td>a',
            url: {selector: 'tr>td>a', attr: 'href'},
            size: 'tr>td:eq(2)>span:eq(1)',
            downloadUrl: {selector: 'tr>td:eq(0)>a', attr: 'href'},
            date: 'tr>td:eq(6)>span:eq(1)'
        },
        listItemSelectorHash: 'table.torrent_info_tbl',
        torrentSelectorHash: {
            title: 'tbody>tr.alt:eq(0)>td:eq(1)',
            url: {selector: 'tbody>tr:eq(2)>td:eq(1)>a:eq(0)', attr: 'href'},
            size: 'tbody>tr.alt:eq(1)>td:eq(1)',
            downloadUrl: {selector: 'tbody>tr:eq(2)>td:eq(1)>a:eq(0)', attr: 'href'},
            date: 'tbody>tr:eq(6)>td:eq(1)'
        },
        onGetValue: {
            date: function (details, value) {
                "use strict";
                value = parseFloat(value);
                return Date.now() / 1000 - value * 24 * 60 * 60;
            },
            size: function (details, value) {
                "use strict";
                return exKit.funcList.sizeFormat(value)
            },
            url: function (details, value) {
                "use strict";
                if (value.substr(0, 7) === 'magnet:') {
                    return details.tracker.lastResponseUrl;
                }
                return value;
            }
        }
    }
};