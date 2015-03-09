torrent_lib.tapochek = function () {
    var name = 'Tapochek';
    var filename = 'tapochek';
    var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS4xLjIiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxMy0wNC0wNVQxMTowNDo5MDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UGl4ZWxtYXRvciAyLjEuMTwveG1wOkNyZWF0b3JUb29sPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6Q29tcHJlc3Npb24+NTwvdGlmZjpDb21wcmVzc2lvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MTwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNjwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE2PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CnayM0MAAALXSURBVDgRhVNNSFRRGD3vvfvezCijTjVOGZow5A9YUWpRCAX9gVa4C8GFLqQg2ugqKBBaZauiaJMtwloVEVRiJVK50wFJy0KyUsufSB3NmWbm/XTuHWvbhXffnfu+73znO98ZDUWdm86e23mrtCh0AtBc/Hd5uut5ydj4966HV5u7RHtHdc/p+trjsQ/z0HUNmkYYuXF5njxnEXlUF47rIZhj+et2Ry+nk7enRFU0crg/9hXdT8aQGzChM0NTQBos04BMsB0S45uV4fKdsR3cbD8qIuGCU4LhaRYRBUEfAn5LlWMMDIJcOVOHkYkf6O59h0DAUIx0ePidcgjsEtDRhMwwDB2GEDCFgbaGKqylMkimbNSWR7B1Yy7mlxKoqYhg+OM8XsamIMhMMYXmKQCdAILJuq4jlOdHU22ZYiK3kkgQnS371O/RyZ8sZpCd908nAnhKPEEQh9RnF9dU8MJyEg/eTKIw34+T+0vV3exiQrXGtpW4cmRCqcsLKosLTdXYsz2sgnv6J9AXmyE4EA7l4OCOLbjUXIO+4Wnc6X1PAH7gUrvBKNnGatJG2s5aIcdvwrIEAj4TPvYs1xp1SaQd6sX4bD6UBpK+Tf7XH49ibimJlmNlaDoUxWZWDnE6e8vCSGUcXHs0holvy/AT+K9XlAbyh64bygflxQWqWn6uhcYD29RZzl+yqCgpwJeFX3AdR6qgvglqSOOwF85djlMGjM+sKEatR6KYo5j3BiZRWZyPlYQNxdZjm+sOVS1wKFkAgjwbmlaekC7cFd2AT7OrCnB8Jg6HDrTYv+2sZ7MR4Xqa6eNlmj1KAU0mZvvTcHfgs7KvvLMztjpnGOfQ2pZpIpNc1cXg0NsX51sb60sK89RM1ETIRJpKuk2O2ZW2lf8FPg77l5OJx+Ppsdjgc3IJlje0XeyorKiso1ayOPfsKNenLCH4UCiieZqnk03i1euB+yNPb/T8ARexGm5JqwBrAAAAAElFTkSuQmCC';
    var login_url = 'http://tapochek.net/login.php';
    var url = 'http://tapochek.net/tracker.php';
    var root_url = 'http://tapochek.net/';
    var about = 'Tapochek.net';
    /*
     * a = требует авторизации
     * l = русскоязычный или нет
     * rs= поддержка русского языка
     */
    var flags = {
        a: 1,
        l: 1,
        rs: 1,
        proxy: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[161, 160],
                /* Музыка */[451, 452, 453, 454, 455, 457, 458, 459, 460, 461, 463, 464, 465, 466, 467, 469, 470, 471, 472, 473, 474, 475, 477, 478, 479, 480, 481, 483, 484, 485, 486, 487, 488, 489, 490, 492, 493, 494, 496, 497, 498, 499, 500, 501, 502, 504, 505, 506, 507, 508, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 402, 403, 399, 401, 404, 400, 535, 536, 537, 538, 539, 540, 541, 542, 543, 545, 546, 547],
                /* Игры */[2, 14, 314, 13, 12, 11, 10, 9, 712, 18, 808, 809, 810, 811, 812, 813, 814, 815, 24, 25, 28, 27, 26, 238, 19, 23, 22, 21, 20, 29, 31, 34, 33, 32, 30, 35, 39, 38, 37, 36, 40, 44, 45, 46, 47, 60, 59, 58, 57, 56, 53, 55, 52, 54, 48, 49, 51, 69, 86, 817, 646, 87, 89, 612, 614, 88, 85, 70, 689, 818, 696, 102, 103, 104, 435, 105, 690, 178, 101, 78, 148, 116, 115, 381, 382, 349, 350, 351, 352, 390],
                /* Фильмы */[429, 703, 430, 431, 74, 144, 121, 122, 123, 124, 145, 146, 149, 150, 151, 152, 126, 75, 127, 128, 130, 131, 133, 135, 156, 635],
                /* Мультфтльмы */[320, 324, 325, 326, 327, 328, 329, 330, 321, 162, 392],
                /* Книги */[717, 740, 738, 739, 836, 838, 837, 843, 713, 724, 728, 725, 727, 723, 721, 722, 844, 718, 715, 839, 719, 846, 840, 842, 841, 716, 714, 845, 741],
                /* ПО */[202, 203, 204, 205, 206, 207, 208, 215, 216, 217, 227, 228, 229, 230, 701, 698, 231, 232, 236, 237, 240, 239, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 409, 607, 593, 595, 594, 257, 258, 259, 260, 261, 262, 263, 264, 265, 268, 269, 270, 271, 272, 273, 274, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 290, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 597, 600, 599, 601, 623, 624, 625, 626, 627, 628, 622, 667, 668, 669, 670, 672, 671, 639, 640, 642],
                /* Анимэ */[693, 684, 677, 96, 678, 660, 95, 106, 109, 107, 685, 687, 686, 688],
                /* Док. и юмор */[],
                /* Спорт */[830, 827, 835, 831, 832, 833, 834],
                /* xxx */[41, 43, 42, 50, 763, 680, 681, 682, 683, 697]
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
            if (t.find('input[name="login_username"]').length) {
                view.auth(0, filename);
                return [];
            } else
                view.auth(1, filename);
            t = t.find('#main_content').find('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('a').attr('href') === undefined) {
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
                    dl: root_url + td.eq(5).children('a').attr('href'),
                    seeds: td.eq(6).text(),
                    leechs: td.eq(7).text(),
                    time: td.eq(9).children('u').text()
                });
            }
            return arr;
        };
        var loadPage = function (text, cb) {
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                tracker: filename,
                mimeType: "text/plain; charset=windows-1251",
                type: 'GET',
                url: url + '?nm=' + ex_kit.in_cp1251(text),
                cache: false,
                success: function (data) {
                    cb(1, readCode(data));
                },
                error: function () {
                    cb(2, 2);
                }
            });
        };
        return {
            getPage: loadPage
        }
    }();
    return {
        find: web.getPage,
        stop: function(){
            if (xhr !== undefined) {
                xhr.abort();
            }
            //view.loadingStatus(1, filename);
        },
        login_url: login_url,
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}();