(function () {
    num = torrent_lib.length;
    torrent_lib[num] = null;
    torrent_lib[num] = function() {
        var name = 'Freedom';
        var filename = 'torrents.freedom';
        var id = null;
        var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAKJJREFUOE9j+E8iYCBR/X98Gr7vXft97RQgiWwoXg0tUe+jFL+3RFFRw/Pn36cUA40EmXpuK5DEa8P39++TDYEqEAjMxekkoNkQpSAbgH6t9oJzsfvhe7YTSEWy4f/v70EqYBbitAHTPAJ+IFkDxDyEk54/J+SHrXOgKrItQZ7OtiSgAeRPWMhAQxZ/sELCDpp+1k75f+3Y/3vXoCRSuJKcWgGsiJbhgQDwngAAAABJRU5ErkJggg%3D%3D';
        var login_url = 'http://torrents.freedom/forum/login.php';
        var url = 'http://torrents.freedom/forum/tracker.php';
        var root_url = 'http://torrents.freedom/forum/';
        var about = 'Локальный торрент-трекер Freedom';
        var flags = {
            a: 1,
            l: 1,
            rs: 1
        }
        var xhr = null;
        var web = function() {
            var calculateCategory = function(f) {
                var groups_arr = [
                    /* Сериалы */[205, 575, 689, 469, 204, 449, 448, 465, 537, 206, 121, 209, 208, 207],
                    /* Музыка */[93, 252, 240, 133, 412, 411, 79, 253, 241, 134, 84, 254, 242, 95, 255, 243, 236, 232, 163, 159, 387, 139, 141, 140, 96, 256, 244, 94, 258, 245, 135, 136, 311, 138, 137, 107, 310, 91, 230, 97, 102, 265, 264, 147, 81, 268, 267, 145, 86, 270, 269, 104, 274, 273, 103, 272, 271, 238, 234, 165, 161, 150, 149, 148, 105, 276, 275, 154, 153, 152, 151, 109, 458, 231, 17, 259, 246, 127, 417, 416, 415, 414, 413, 80, 260, 247, 128, 83, 261, 248, 37, 262, 249, 237, 233, 164, 574, 160, 144, 142, 143, 38, 263, 250, 92, 257, 251, 75, 25, 24, 77, 108, 312, 456, 228, 457, 18, 278, 277, 129, 82, 280, 279, 130, 85, 282, 281, 41, 286, 285, 40, 284, 283, 239, 235, 166, 162, 157, 156, 155, 106, 288, 287, 26, 76, 23, 78, 110, 100, 229, 101],
                    /* Игры */[664, 718, 717, 719, 665, 562, 87, 545, 546, 557, 558, 559, 560, 65, 477, 476, 475, 66, 71, 561, 64, 70, 481, 479, 478, 67, 578, 73, 370, 579, 580, 74, 367, 482, 181, 68, 483, 484, 365, 711, 715, 366, 563, 564, 565, 566, 567, 568, 569, 571, 572, 573, 653, 125, 660, 485, 659, 658, 657, 486, 656, 655, 487, 309],
                    /* Фильмы */[9, 454, 468, 667, 430, 589, 590, 668, 433, 390, 305, 398, 434, 464, 7, 447, 437, 654, 587, 669, 455, 588, 670, 438, 442, 439, 301, 441, 10, 541, 540, 544, 576, 306, 8, 452, 302, 581],
                    /* Мультфтльмы */[584, 173, 615, 666, 172, 613, 614, 171, 612, 170, 609, 608, 169, 606, 607, 168, 445, 444, 446, 610, 662, 536, 611, 179, 177, 178, 176, 549, 548, 547, 577, 651, 175, 174, 582],
                    /* Книги */[601, 697, 353, 355, 602, 356, 357, 358, 52, 603, 690, 663, 534, 535, 354, 497, 351, 500, 501, 604, 499, 352, 498, 350, 324, 519, 492, 518, 493, 494, 495, 496, 515, 516, 342, 713, 513, 55, 341, 326, 343, 347, 686, 346, 345, 712, 344, 348, 349, 685, 359, 360, 363, 364, 361, 49, 695, 694, 317, 313, 314, 319, 318, 687, 688, 315, 202, 203, 505, 379, 383, 384, 381, 380, 378, 382, 385, 377, 376, 375, 386],
                    /* ПО */[47, 467, 462, 44, 459, 460, 461, 43, 523, 645, 524, 525, 526, 527, 646, 647, 644, 48, 46, 42, 528, 117, 466, 650, 131, 649, 648],
                    /* Анимэ */[124, 583, 451, 616, 167, 126, 158, 368, 369, 220, 683, 684],
                    /* Док. и юмор */[13, 187, 188, 298, 299, 300, 297, 296, 190, 191, 295, 291, 619, 201, 15, 185, 184, 629, 183, 542, 714, 186, 630, 122, 304, 14, 215, 214, 213, 212, 211, 210, 123],
                    /* Спорт */[88, 196, 193, 192, 586, 194, 195, 198, 618, 585, 199, 197, 627, 628]
                ];
                for (var i = 0; i < groups_arr.length; i++)
                    if (jQuery.inArray(parseInt(f), groups_arr[i]) > -1) {
                        return i;
                    }
                return -1;
            }
            var calculateSize = function(s) {
                var type = '';
                var size = s.replace(' ', '').replace(',', '.');
                var t = size.replace('KB', '');
                if (t.length != size.length) {
                    t = parseFloat(t);
                    return Math.round(t * 1024);
                }
                var t = size.replace('MB', '');
                if (t.length != size.length) {
                    t = parseFloat(t);
                    return Math.round(t * 1024 * 1024);
                }
                var t = size.replace('GB', '');
                if (t.length != size.length) {
                    t = parseFloat(t);
                    return Math.round(t * 1024 * 1024 * 1024);
                }
                var t = size.replace('TB', '');
                if (t.length != size.length) {
                    t = parseFloat(t);
                    return Math.round(t * 1024 * 1024 * 1024 * 1024);
                }
                return 0;
            }
            var calculateTime = function(time) {
                time = $.trim(time).split(" ");
                time[1] = time[1].replace('Янв', '1').replace('Фев', '2').replace('Мар', '3')
                        .replace('Апр', '4').replace('Май', '5').replace('Июн', '6')
                        .replace('Июл', '7').replace('Авг', '8').replace('Сен', '9')
                        .replace('Окт', '10').replace('Ноя', '11').replace('Дек', '12');
                var date = time[1].split('-');
                time = time[0].split(':');
                return Math.round((new Date(parseInt('20' + date[2]), parseInt(date[1]) - 1, parseInt(date[0]), parseInt(time[0]), parseInt(time[1]))).getTime() / 1000);
            }
            var readCode = function(c) {
                c = view.contentFilter(c);
                var t = view.load_in_sandbox(id, c);
                if (t.find('input[name="login_username"]').length) {
                    view.auth(0, id);
                    return [];
                } else
                    view.auth(1, id);
                t = t.find('table.forumline').find('tr');
                var l = t.length;
                var arr = [];
                var i = 0;
                for (i = 1; i < l; i++) {
                    var td = t.eq(i).children('td');
                    if (td.eq(6).children('a').attr('href') == null)
                        continue;
                    arr[arr.length] = {
                        'category': {
                            'title': td.eq(3).children('a').text(),
                            'url': root_url + td.eq(3).children('a').attr('href'),
                            'id': calculateCategory(td.eq(3).children('a').attr('href').replace(/.*f=([0-9]*).*$/i, "$1"))
                        },
                        'title': td.eq(4).children('a').text(),
                        'url': root_url + td.eq(4).children('a').attr('href'),
                        'size': calculateSize(td.eq(7).text()),
                        'dl': root_url + td.eq(6).children('a').attr('href'),
                        'seeds': td.eq(8).children('b').text(),
                        'leechs': td.eq(9).children('b').text(),
                        'time': calculateTime(td.eq(11).children('p').eq(0).text() + ' ' + td.eq(11).children('p').eq(1).text())
                    }
                }
                return arr;
            }
            var encode = function(sValue) {
                var text = "", Ucode, ExitValue, s;
                for (var i = 0; i < sValue.length; i++) {
                    s = sValue.charAt(i);
                    Ucode = s.charCodeAt(0);
                    var Acode = Ucode;
                    if (Ucode > 1039 && Ucode < 1104) {
                        Acode -= 848;
                        ExitValue = "%" + Acode.toString(16);
                    }
                    else if (Ucode == 1025) {
                        Acode = 168;
                        ExitValue = "%" + Acode.toString(16);
                    }
                    else if (Ucode == 1105) {
                        Acode = 184;
                        ExitValue = "%" + Acode.toString(16);
                    }
                    else if (Ucode == 32) {
                        Acode = 32;
                        ExitValue = "%" + Acode.toString(16);
                    }
                    else if (Ucode == 10) {
                        Acode = 10;
                        ExitValue = "%0A";
                    }
                    else {
                        ExitValue = s;
                    }
                    text = text + ExitValue;
                }
                return text;
            }
            var loadPage = function(text) {
                var t = text;
                if (xhr != null)
                    xhr.abort();
                xhr = $.ajax({
                    type: 'POST',
                    url: url + '?nm=' + encode(text),
                    cache: false,
                    data: {
                        'prev_allw': 1,
                        'prev_a': 0,
                        'prev_dla': 0,
                        'prev_dlc': 0,
                        'prev_dld': 0,
                        'prev_dlw': 0,
                        'prev_my': 0,
                        'prev_new': 0,
                        'prev_sd': 0,
                        'prev_da': 1,
                        'prev_dc': 1,
                        'prev_df': 1,
                        'prev_ds': 0,
                        'f[]': -1,
                        'o': 1,
                        's': 2,
                        'tm': -1,
                        'sns': -1,
                        'dc': 1,
                        'df': 1,
                        'da': 1,
                        'pn': '',
                        'allw': 1,
                        'submit': ''
                    },
                    success: function(data) {
                        view.result(id, readCode(data), t);
                    },
                    error: function() {
                        view.loadingStatus(2, id);
                    }
                });
            }
            return {
                getPage: function(a) {
                    return loadPage(a);
                }
            }
        }();
        var find = function(text) {
            return web.getPage(text);
        }
        return {
            find: function(a) {
                return find(a);
            },
            setId: function(a) {
                id = a;
            },
            id: id,
            login_url: login_url,
            name: name,
            icon: icon,
            about: about,
            url: root_url,
            filename: filename,
            flags: flags,
            tests: [0,0,0,0,0,0,0,0,0]
        }
    }();
    if (compression === 0) {
        engine.ModuleLoaded(num);
    }
})();