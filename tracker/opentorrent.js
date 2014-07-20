torrent_lib.opentorrent = function () {
    var name = 'OpenTorrent';
    var filename = 'opentorrent';
    var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AkeBics+G6WHQAAAf9JREFUOMulk0tI1FEUh7878x8fmUVJCL3ICIKM3hRF0YuYVbQrilZBpJtCCo0e4KKFBRZC4iZBW5op4SwMCUZTKVBo0TsEdYrSqRB1nHHm/v+/FmpkOQj5Lc+59zv3XM4xksQC8M0VlIS8UVz3+/8JhmMhrj/L5/H78/MKzEwLkjDG8OjNcULvQsSTDtkZltvBZvIXn8AYk/4FkrAaoKRlJbUvQ6zIhUTKEk861PZcSnsZwAEwxlDWeoCkN0LruVEgQMfAfaqeXyXgg7sRqOuz/O0pXDYtmLDDVPd+JnrlKWVtRzi8LkimswTXEyc3lVFQZ1m9C5ZPC6Ix+DpmuFZoQJKq24u0rQJNep9EMZLiOt3gV7Ae1fRJVKTUNeFKkjrHXR0NW9GYkiQhSVmlqLRxv6z7Q4M/w6ps3yP/5YCquovFRU/OLatD9VZPoq64aeXcs7rQaSVJTtPHchJRhzstXXyJFfAhOkpPvwNxy6oNpdARxyZFyYtFFDW4OEMGG4GDZ6f6Mcce5Kjtdeyf3z21fSff+nvoaoph9/qJ1GSyZt8kzlo/NsOih9mz52Aucs8kSLx1UZ4PN8uHE0lhlxpeNeewJW9qblAaPM9T76DE+jE5W8fl3zim3eUpDcmT53m/z6UVzLDjRkJsjqmyOzVnfl6BJIVHZlf9E7PQdf4FVC+nbLqwD1EAAAAASUVORK5CYII%3D';
    var login_url = 'http://opentorrent.ru/login.php';
    var url = 'http://opentorrent.ru/tracker.php';
    var root_url = 'http://opentorrent.ru/';
    var about = 'Открытый удмуртский битторрент-трекер';
    var flags = {
        a: 1,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[96, 344, 688, 689, 705, 511, 690, 264, 265, 384, 687, 445, 439, 708, 709, 97, 467, 515, 259, 297, 430, 142, 262, 504, 531, 537, 435, 300, 433, 503, 147, 296, 526, 505, 529, 295, 514, 159, 153, 139, 431, 143, 162, 253, 525, 140, 436, 446, 512, 207, 137, 343, 532, 141, 434, 161, 534, 535, 145, 151, 144, 502, 148, 197, 542, 298, 533, 513, 440, 516, 209, 536, 530, 150],
                /* Музыка */[554, 560, 561, 562, 563, 564, 555, 566, 567, 568, 569, 570, 571, 572, 573, 556, 576, 577, 578, 579, 580, 581, 582, 583, 557, 586, 587, 588, 590, 591, 592, 593, 594, 558, 596, 597, 598, 599, 600, 601, 559, 603, 604, 605, 606, 585, 613, 614, 615, 616, 617, 618, 619, 676, 620, 589, 629, 628, 627, 626, 625, 624, 623, 622, 675, 621, 608, 638, 637, 636, 635, 634, 633, 631, 677, 630, 609, 642, 641, 640, 678, 639, 610, 653, 652, 651, 650, 649, 648, 647, 646, 645, 644, 643, 73, 656, 405, 655, 354, 654, 70, 441, 442, 69, 510, 509, 659, 508, 657, 658, 355, 660, 662, 663, 36, 258, 257, 489, 664, 358, 665, 125, 418, 419, 667, 668, 359, 669, 170, 341, 360, 218, 670, 671, 672, 361, 398, 403, 402, 399, 375, 377, 376, 501, 673, 380, 35, 215, 213],
                /* Игры */[286, 11, 686, 123, 116, 88, 95, 93, 89, 92, 90, 220, 94, 91, 272, 276, 275, 274, 273, 277, 12, 522, 242, 707, 241, 413, 414, 406, 13, 221, 214, 236, 235, 234, 233, 231, 230, 229, 228, 227, 226, 225, 224, 223, 222],
                /* Фильмы */[16, 486, 211, 15, 417, 238, 550, 266, 420, 14, 342, 350, 421, 81, 210, 280, 155, 552, 680, 546, 429, 77, 517, 722, 723, 538],
                /* Мультфтльмы */[59, 483, 134, 156, 132, 133, 157, 271, 216, 468, 451, 58, 240, 239, 158, 679, 428, 518],
                /* Книги */[75, 389, 390, 412, 391, 348, 237, 217, 249, 497, 415, 64],
                /* ПО */[184, 460, 46, 329, 322, 323, 324, 325, 427, 326, 327, 328, 443, 47, 45, 49, 51, 48, 80, 456, 487, 38, 488, 462, 466, 461, 186, 464, 463, 334, 470, 469, 447, 471, 163, 320, 321],
                /* Анимэ */[9, 86, 85, 527, 83, 263, 681, 284, 283, 282, 84, 82, 269, 166, 281, 172, 173],
                /* Док. и юмор */[98, 499, 79, 481, 495, 482, 268, 270, 54, 135, 548, 438, 164, 165, 494, 506, 682, 551, 541],
                /* Спорт */[169, 685, 374, 202, 544, 373, 543, 437, 201, 200, 345, 346, 267, 545],
                /* xxx */[484]
            ];
            f = parseInt(f);
            for (var i = 0, len = groups_arr.length; i < len; i++) {
                if (groups_arr[i].indexOf(f) !== -1) {
                    return i;
                }
            }
            return -1;
        };
        var calculateTime = function (f) {
            var dd = f.split('.');
            return Math.round(new Date(parseInt(dd[2]), parseInt(dd[1]) - 1, parseInt(dd[0])).getTime() / 1000);
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            if (t.find('input[name="username"]').length) {
                view.auth(0, filename);
                return [];
            } else
                view.auth(1, filename);
            t = t.find('table.forumline.tracker').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 1; i < l - 1; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(1).children('a').attr('href') === undefined || td.eq(2).children('a').text() == '') {
                    continue;
                }
                arr.push({
                    category: {
                        title: td.eq(1).children('a').text(),
                        url: root_url + td.eq(1).children('a').attr('href'),
                        id: calculateCategory(td.eq(1).children('a').attr('href').replace(/.*f=([0-9]*)$/i, "$1"))
                    },
                    title: td.eq(2).children('a').text(),
                    url: root_url + td.eq(2).children('a').attr('href'),
                    size: ex_kit.format_size(td.eq(5).text()),
                    dl: root_url + td.eq(4).children('a').attr('href'),
                    seeds: td.eq(6).text(),
                    leechs: td.eq(7).text(),
                    time: calculateTime(td.eq(8).text())
                });
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                tracker: filename,
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