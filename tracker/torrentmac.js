torrent_lib.torrentmac = function () {
    var name = 'TorrentMac';
    var filename = 'torrentmac';
    var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS4xLjIiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxMy0wNC0wM1QxMzowNDo3NDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UGl4ZWxtYXRvciAyLjEuMTwveG1wOkNyZWF0b3JUb29sPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6Q29tcHJlc3Npb24+NTwvdGlmZjpDb21wcmVzc2lvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MTwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNjwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE2PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CnZUfPUAAAJ/SURBVCgVFVHJbhNBFOzu6e7ZPbaz2E5ikIgJ6wkJIe5cuXHgAr/Gt3BHCHIgigiEBAfHiT3j2ad3Onrb5VXVUz347tV7B6kkCcc7o8j1PAcNh33edrxTysfQxbY1ZcXqUmAkDMWHvUdc5RSY2IRDN+hhGruJNLXa9tiTKV5s3LoupOkw6QCAFcIvJi/TalF0tz6no3iyE/l9L9bb4NcsHhF/NycFop5GdVu3rdyIBktNp/5s3pD17U0Tw2Q4jkME9pPDIRksOg58BxmfUFWB65vLjOe4KDLBvZ7YWYNmNRaf4+VBHHu5SpzouPp3y/i2xHtrmJ5snB7angzxfT+qmmqV5vsfp28+vIYGci7my8xQ8mz2tG27TcfOP30fB/3hNClRiSERB0kvmUV7b5+zmjPOpdARJXauq1oZkB7PI94mR7sNKUED8Gl+OpTxztY9DfQmr4RQUilbNpgQrTD5zfXs4SAYBEJIpGvsJCaM/GgU5mklhWKMQQiV1jYBMFZncu/gAU40U6XuJHQwigyJpEbsZpVbN5A1BRiEHMfBENkpsXACRbKyWq9Wt1mKmWQtq52yECLcSiJKiWUHEEAILMhiS9J+OVuEy6sszQh1seNqEUHUFoHYDeIoDoK7XWPsPZYfABAl8dl8pZu6ZV1ZKUx9v7LmZWX/j28eHyWDAaFQSm2syh0UrNJNcLnmFNOI2ofjNONG8tDzwcVV+O0HMmqShCznvOSIYEZV+vW8uPybwUZiRTyCF8vcDx3kUghkenK6vvhdunHQ+NXPtkvFdZD6A5TDppCN0kp1ABe1dLCRUrUUNIYNBKhZJlDX9BjuAtnp+SblrtQYCgEZM/8BpHmKVQzFcUYAAAAASUVORK5CYII%3D';
    var url = 'http://torrentmac.org/tracker.php';
    var root_url = 'http://torrentmac.org/';
    var about = 'TorrentMac';
    /*
     * a = требует авторизации
     * l = русскоязычный или нет
     * rs= поддержка русского языка
     */
    var flags = {
        a: 0,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[],
                /* Музыка */[331, 338, 332, 339, 333, 340, 334, 341, 335, 342, 336, 343, 337, 344, 273, 345],
                /* Игры */[347, 115, 17, 366, 369, 365, 364, 363, 362, 361, 360, 359, 367, 368, 88],
                /* Фильмы */[269, 24],
                /* Мультфтльмы */[],
                /* Книги */[270, 7, 9, 105],
                /* ПО */[20, 116, 100, 99, 267, 268, 199, 253, 11, 109, 13, 356, 355, 80, 14, 256, 81, 42, 351, 350, 255, 82, 15, 211, 83, 39, 84, 46, 208, 85, 70, 86, 16, 87]
            ];
            f = parseInt(f);
            for (var i = 0, len = groups_arr.length; i < len; i++){
                if (groups_arr[i].indexOf(f) !== -1) {
                    return i;
                }
            }
            return -1;
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('div.sectionMain').children('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('span').children('a').attr('href') === undefined) {
                    continue;
                }
                arr.push({
                    category: {
                        title: td.eq(2).children('a').text(),
                        url: root_url + td.eq(2).children('a').attr('href'),
                        id: calculateCategory(td.eq(2).children('a').attr('href').replace(/.*f=([0-9]*).*$/i, "$1"))
                    },
                    title: td.eq(3).children('a').text(),
                    url: root_url + td.eq(3).children('a').attr('href'),
                    size: td.eq(5).children('u').text(),
                    dl: td.eq(5).children('span').children('a').attr('href'),
                    seeds: td.eq(6).text(),
                    leechs: td.eq(7).text(),
                    time: td.eq(9).children('u').text()
                });
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                type: 'POST',
                url: url,
                cache: false,
                data: {
                    nm: text
                },
                success: function (data) {
                    view.result(filename, readCode(data), t);
                },
                error: function () {
                    view.loadingStatus(2, filename);
                }
            });
        };
        return {
            getPage: function (a) {
                return loadPage(a);
            }
        }
    }();
    var find = function (text) {
        return web.getPage(text);
    };
    return {
        find: function (a) {
            return find(a);
        },
        stop: function(){
            if (xhr !== undefined) {
                xhr.abort();
            }
            //view.loadingStatus(1, filename);
        },
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}();