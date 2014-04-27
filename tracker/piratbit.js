torrent_lib.piratbit = function () {
    var name = 'Piratbit';
    var filename = 'piratbit';
    var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACf0lEQVR4nI2SW0gUYRTH//ON3+yszbQ7rutqu6WRj3ZRS0iQIozeIrAeJAqD8iGiICOIiJLAXpKoB4uIejHMZAoqCKR9atNIKizwEhWuPmRpq3tx19n55vt6CKWLt/N4Lj/O/5y/hBVEyNQIheIjkDcTkICBvMibusEoAEhLDQZNzZAh72WwD0ggVIHSQUGffKr7HpvrWRAQMnU/g91owz6mcHVUZLQWyt3hsYYR+9/evwBrTZ1KIPWzSF8SnECJh5qzY+s7JppfZJfVWWJ6C4Km9iDPlLLBTu/DotaqNXO13Oo7i0qVfg8boSysxxmkKzzcd82aCJz/dnzA0vdcL0x/2HhaZDxbJSKNEEm+J7gTYVMVYh5QYhpKFtbzDNK73FjVR7P6jmj9eMbfeMITMxuewSEQglhcWJsgHI0quVcEd1rYVKUDADkq3OUzSEYA1MiQu6L14xkAcCWLS7Tq8GHYNMomAxCxkM+O65ft7MwFVdUmGHDrTwkKB+9KI7XT4/hPsuTqThY3LD7tl10qq+YD2/tH2y/GaUGPwmaVbiHsIonQu6qL3p4/TrHp9XHw+ykka1WoXyjoVwe8kCYKwyNHPp8BgNxgX3k6Yb+E4G6qaGft2JZWMgeI1k3/lIW8z8t9R3O4a4gzmbBJ/81UT+05AFBLu0OzM2iD4KpMtTYunBtLvjW/af/8dsqG7hp4Xg9A752WPP1NsvGOLusLAFDKHvlJIHIVem8c+tswPB+3LeiD/5J57w0IdkgwcQrC+QGitgLiKRIV1qIAJX9IcpgoFYId5NzeDYkMESK3cyf7CsnKRa0sAYCxbpjYNqlKZ5xSITAoBBtGoiy1Epm/AGvkDrjq7XpKAAAAAElFTkSuQmCC';
    var url = 'http://piratbit.net/tracker.php';
    var root_url = 'http://piratbit.net';
    var about = 'Крупнейший русскоязычный торрент трекер. фильмы, dvdrip, hdrip, 720p, 1080p, repack, сериалы, mp3...';
    /*
     * a = требует авторизации
     * l = русскоязычный или нет
     * rs= поддержка русского языка
     */
    var flags = {
        a: 1,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[24, 767, 766, 764, 762, 763, 25, 1566, 1511, 1510, 1427, 1415, 1413, 1412, 1411, 1410, 1242, 1243, 1232, 777, 773, 776, 775, 778],
                /* Музыка */[1342, 1341, 887, 888, 936, 957, 956, 955, 954, 953, 951, 950, 949, 944, 988, 1000, 999, 998, 997, 1036, 1037, 1192, 1191, 1175, 1178, 1169, 1201, 1187, 1157, 1173, 1159, 1163, 1166, 1156, 1042, 1048, 1565, 1021, 1562, 1019, 1647, 1068, 1069, 1537, 1085, 1083, 1082, 1081, 1080, 1078, 1077, 1076, 1073, 1072, 1070, 1086, 1538, 1105, 1104, 1101, 1100, 1099, 1098, 1097, 1096, 1094, 1095, 1093, 1092, 1091, 1090, 1089, 1087, 1106, 1121, 1120, 1119, 1118, 1117, 1115, 1114, 1113, 1112, 1111, 1110, 1109, 1108, 1107, 1122, 1541, 1131, 1130, 1129, 1544, 1128, 1127, 1126, 1125, 1124, 1123, 1132, 1139, 1138, 1137, 1136, 1135, 1134, 1133, 1140, 1154, 1153, 1152, 1151, 1150, 1149, 1148, 1147, 1146, 1145, 1144, 1143, 1142, 1141, 668],
                /* Игры */[1612, 1257, 206, 1263, 1264, 1265, 1266, 1267, 1268, 203, 1321, 200, 1274, 1271, 1275, 1273, 1272, 202, 195, 194, 1542, 192, 1253, 1443, 1330, 1329, 1328, 1327, 1333, 1486, 50, 1363, 1420, 1364, 1323, 49, 1366, 1365, 1368, 1367, 1246, 1245, 1244, 51, 672, 645, 649],
                /* Фильмы */[1569, 1570, 1418, 1419, 1280, 5, 6, 7, 8, 4, 171, 1422, 84, 1394, 9, 1583, 1582, 12, 10, 11, 13, 1560, 17, 16, 1627, 14, 15, 1626, 1567, 138, 139, 115, 114, 366, 671, 670, 669, 80, 392, 389, 388, 382, 368],
                /* Мультфтльмы */[19, 1614, 22, 21, 168, 1613, 20, 1424, 1269, 1423, 1270],
                /* Книги */[1407, 1331, 1234, 1233, 1239, 1237, 1236, 1235, 1240, 677, 728, 737, 718, 722, 708, 723, 754, 1326, 788, 801, 800, 799, 798, 797, 814, 795, 794, 816, 793, 796, 791, 792, 675],
                /* ПО */[181, 519, 532, 531, 530, 529, 528, 527, 526, 525, 524, 521, 520, 52, 538, 537, 536, 535, 534, 54, 544, 543, 542, 541, 540, 539, 55, 565, 563, 562, 561, 560, 559, 558, 557, 556, 555, 554, 553, 552, 551, 550, 549, 548, 547, 546, 545, 56, 577, 576, 575, 574, 573, 572, 571, 570, 569, 568, 567, 566, 578, 587, 586, 585, 584, 583, 582, 581, 580, 579, 588, 604, 603, 602, 601, 600, 599, 598, 597, 596, 595, 594, 593, 592, 591, 590, 589, 605, 624, 623, 621, 619, 617, 616, 615, 614, 610, 609, 608, 607, 606, 655, 667, 666, 665, 664, 663, 662, 661, 660, 659, 658, 1561, 169, 673, 646, 647, 650],
                /* Анимэ */[286, 1372, 290, 269, 289, 288, 287],
                /* Док. и юмор */[1390, 79, 359, 348, 345, 342, 363, 361, 362, 818, 1362, 1361],
                /* Спорт */[81, 414, 413, 408, 412, 406, 405, 404, 403, 399, 396, 395, 394, 82, 1631, 1630, 428, 427, 424, 426, 425, 423, 422, 421, 420, 419, 418, 417, 416, 431, 443, 440, 439, 438, 437, 436, 435, 434, 433, 432],
                /* XXX */[1615, 1616, 1617, 1618, 1478, 1492, 1292, 1426, 250, 294, 271, 251, 1515, 1349, 248, 249, 252, 253, 1289, 1324, 299, 246, 1359, 255, 275, 1568, 261, 264, 265, 263, 262, 1358, 257, 260, 259, 266, 267, 256, 1347, 247]
            ];
            f = parseInt(f);
            for (var i = 0, len = groups_arr.length; i < len; i++) {
                if (groups_arr[i].indexOf(f) !== -1) {
                    return i;
                }
            }
            return -1;
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(3).children('div').children('a').attr('href') === undefined) {
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
                    size: td.eq(3).children('u').text(),
                    dl: root_url + td.eq(3).children('div').children('a').attr('href'),
                    seeds: td.eq(4).children('b').text(),
                    leechs: td.eq(5).children('b').text(),
                    time: td.eq(7).children('u').text()
                });
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = $.ajax({
                type: 'POST',
                url: url,
                cache: false,
                data: {
                    max: 1,
                    to: 1,
                    ss: text
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