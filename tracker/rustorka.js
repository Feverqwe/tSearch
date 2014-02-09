torrent_lib.rustorka = function () {
    var name = 'Rustorka';
    var filename = 'rustorka';
    var icon = 'data:image/png;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAq41tANG9qwCcck4AmG5JALKQdQDk3dUAnnRRANC9rACWaEIAeUIRAMivmgCDTB4Apn9cAJ50UgCnhWQA9vLtAL6jiwCJWC4As5V5AIxYLgCEUSEApX1aANbDtQDRv7AAgk8fAK6LbQCASh0AqIBjAKuHaABzPwsA1cSzAIFNHQDj2M0Ag00dAJ91UQDAp5IAy7ikAKV7WQDHrpcAx7SfAJVpQgDl3NMAq4NkAJlxTQCFUSQAzrqoANDAsACzlHcApX9gAMmyngB8RRUA0LyrAIVPIgB4QxMAo4BeAOff1QCackwAhlMoAOfb0ACNYDUA6OHYAJNjPQCsiGkA3s/BAJlsRQDFrJgAoXxaAMOokwCSZDsAdzsKAN/VygCTaEEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwIAAAAAAEABAAAAAAAAACA2DCwkMS0zRgAAAAAAAAAUPi9DIkguMB4AAAAAAAAADjUAAAAAAD8bAAAAAAAARxUSAAAAAAAaCjIAAAAABkEmAAAAAAAAAAVFNAAAQg0HKAAAAAAAAAAXNyNCAB8IJUQcOQIAKhYDHRELHwAAAAAAOBMpISsEOAAAAAAAAAAAAAAQCTw6GAAAAAAAAAAAAAAAADsZJwAAAAAAAAAAAAAAAAAAPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AAD//wAA//8AAOfPAADgDwAA4A8AAOfPAADHxwAAj+MAAA/hAAABAQAA8B8AAPg/AAD8fwAA/v8AAP//AAA%3D';
    var login_url = 'http://rustorka.com/forum/login.php';
    var url = 'http://rustorka.com/forum/tracker.php';
    var root_url = 'http://rustorka.com/forum/';
    var about = 'Международный торрент-трекер, у нас можно бесплатно скачать через торрент фильмы, игры, музыку, mp3/lossless, программы, отечественные и зарубежные сериалы, книги, мультфильмы, аниме.';
    var flags = {
        a: 1,
        l: 1,
        rs: 1
    };
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[189, 1109, 237, 236, 1249, 235, 1234, 233, 1107, 1248, 1112, 1250, 1235, 1233, 231, 229, 228, 1111, 227, 1115, 1113, 1100, 225, 224, 1253, 221, 850, 1101, 219, 1108, 1237, 216, 1106, 1238, 1240, 212, 210, 208, 207, 1242, 204, 843, 203, 1247, 1114, 1103, 1164, 1102, 848, 198, 1241, 197, 1246, 845, 196, 195, 1239, 194, 1228, 1225, 1226, 1254, 1104, 1110, 847, 1255, 1258, 1259, 1257, 1256, 1311, 1227, 1245, 1244, 1243, 1252],
                /* Музыка */[471, 769, 1160, 767, 473, 474, 475, 1159, 728, 476, 478, 479, 480, 770, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 507, 506, 505, 496, 669, 789, 702, 700, 699, 697, 696, 694, 692, 691, 690, 689, 688, 687, 684, 683, 1031, 679, 1158, 678, 677, 674, 671, 788, 704, 508, 511, 510, 509, 512, 708, 709, 710, 711, 513, 516, 1265, 518, 738, 517, 519, 522, 521, 520, 730, 735, 734, 733, 732, 731, 523, 716, 714, 715, 1148, 713, 712, 524, 525, 529, 528, 526, 527, 668, 530, 542, 541, 822, 766, 764, 765, 540, 539, 538, 763, 739, 537, 705, 536, 535, 707, 706, 740, 741, 533, 532, 543, 548, 547, 546, 545, 544, 549, 551, 550, 553],
                /* Игры */[67, 1136, 393, 824, 842, 837, 836, 835, 834, 833, 832, 831, 830, 839, 829, 828, 827, 838, 826, 825, 1267, 1283, 1282, 1281, 1280, 1279, 1278, 1277, 1276, 1275, 1273, 1272, 1271, 1270, 1269, 1268, 1274, 1318, 1334, 1333, 1332, 1331, 1330, 1329, 1328, 1327, 1326, 1325, 1324, 1323, 1322, 1321, 1320, 1319, 1015, 1030, 1029, 1028, 1027, 1026, 1025, 1024, 1023, 1022, 1021, 1020, 1019, 1018, 1017, 1016, 1149, 73, 74, 75, 77, 76, 78, 80, 81, 82, 83, 840, 84, 85, 86, 87, 92, 89, 90, 791, 792, 793, 1143, 794, 1260, 91, 88, 636, 93, 795, 94, 95, 96, 97, 98, 99, 100, 101, 102, 107, 103, 1090, 104, 1091, 106, 108, 109, 110, 760, 295, 578, 297, 1086, 1032, 1087, 776, 296, 298, 1033, 1138, 1262, 1099, 301, 300, 620, 619, 451, 299, 302, 305, 1285, 464, 303, 306, 307, 308, 309, 315, 314, 313, 312, 755, 459, 311, 576, 310],
                /* Фильмы */[15, 627, 626, 631, 629, 630, 628, 632, 1013, 777, 1116, 1133, 1132, 1131, 1130, 1129, 1128, 1127, 1126, 1125, 1124, 1123, 1122, 1121, 1120, 1119, 1118, 1117, 579, 597, 596, 595, 594, 593, 592, 591, 590, 589, 588, 587, 586, 585, 584, 583, 582, 581, 18, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 33, 34, 35, 36, 790, 37, 580, 616, 614, 613, 612, 611, 610, 609, 608, 607, 606, 605, 604, 603, 602, 601, 600, 599, 452, 39],
                /* Мультфтльмы */[1081, 1085, 1084, 1083, 1082, 44, 48, 854, 50, 49, 1034, 51, 812, 811, 810, 809, 808, 807, 52, 53, 458, 54, 55, 56, 57, 58, 62],
                /* Книги */[333, 1209, 1215, 1216, 1217, 1218, 1219, 1212, 1211, 1210, 338, 1223, 339, 341, 817, 340, 1222, 816, 1221, 1220, 337, 841, 335, 334, 1214, 761, 1315, 815, 1224, 814, 813, 1316, 1313, 1314, 1317, 343, 821, 820, 819, 818, 346, 345, 1142, 344, 1140, 347, 348],
                /* ПО */[349, 352, 351, 350, 353, 356, 355, 354, 357, 362, 361, 360, 359, 1139, 358, 363, 367, 366, 365, 460, 364, 1070, 368, 371, 370, 369, 1071, 1072, 1073, 372, 376, 375, 374, 373, 762, 377, 381, 380, 379, 378, 1074, 1075, 382, 387, 386, 385, 384, 383],
                /* Анимэ */[662, 659, 661, 660, 658, 663, 657, 1161, 1163, 1162, 654, 1310, 655, 656, 650, 653, 652, 1208, 651, 643, 644, 646, 645, 1286, 1287],
                /* Док. и юмор */[151, 796, 797, 152, 801, 802, 153, 154, 804, 800, 799, 798, 803, 155, 156, 157, 640, 158, 159, 160, 161, 163, 164, 165, 166, 167, 168],
                /* Спорт */[169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 856, 859, 860, 861, 187],
                /* Порно */[1052, 1067, 1066, 1065, 1064, 1063, 1062, 1061, 1060, 1059, 1058, 1057, 1056, 1055, 1054, 1053]
            ];
            for (var i = 0; i < groups_arr.length; i++)
                if (jQuery.inArray(parseInt(f), groups_arr[i]) > -1) {
                    return i;
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
            t = t.find('#main_content_wrap').children('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('a').attr('href') == null)
                    continue;
                arr[arr.length] = {
                    'category': {
                        'title': td.eq(2).children('a').text(),
                        'url': root_url + td.eq(2).children('a').attr('href'),
                        'id': calculateCategory(td.eq(2).children('a').attr('href').replace(/.*f=([0-9]*).*$/i, "$1"))
                    },
                    'title': td.eq(3).children('a').text(),
                    'url': root_url + td.eq(3).children('a').attr('href'),
                    'size': td.eq(6).children('u').text(),
                    'dl': root_url + td.eq(5).children('a').attr('href'),
                    'seeds': td.eq(7).children('b').text(),
                    'leechs': td.eq(8).children('b').text(),
                    'time': td.eq(10).children('u').text()
                }
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'POST',
                url: url + '?nm=' + ex_kit.in_cp1251(text),
                cache: false,
                data: {
                    'max': 1,
                    'to': 1
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