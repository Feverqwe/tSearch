// ==UserScript==
// @name TFile
// @trackerURL http://tfile.co
// @icon data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAADksgYAAAD/AAAAAACkpKUA4ODgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMzMzMzMzMzMjIyMjIyMjIzMzMzMzMzMzRERERERERERBFARAQEQABEFEBEBAQERAQUQEQEBARERBRARAQEAAAEFEBEBAQERAERAAQEBEAARBRAREQEREREFEQEBAREREREREREREREQzMzMzMzMzMzIyMjIyMjIyMzMzMzMzMzMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
// @description Торрент трекер tfile.co - фильмы, музыка, программы, книги.
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/tfile.js
// @connect *://tfile.co/*
// @require exKit
// @version 1.0.1
// ==/UserScript==

API_exKit({
    version: 2,
    id: 'tfile',
    title: 'TFile',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAADksgYAAAD/AAAAAACkpKUA4ODgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMzMzMzMzMzMjIyMjIyMjIzMzMzMzMzMzRERERERERERBFARAQEQABEFEBEBAQERAQUQEQEBARERBRARAQEAAAEFEBEBAQERAERAAQEBEAARBRAREQEREREFEQEBAREREREREREREREQzMzMzMzMzMzIyMjIyMjIyMzMzMzMzMzMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    desc: 'Торрент трекер tfile.co - фильмы, музыка, программы, книги.',
    flags: {
        auth: 0,
        language: 'ru',
        cyrillic: 1
    },
    categoryList: {
        serials: [37, 1323, 1252, 697, 322, 323, 1235, 172, 135, 311, 183, 130, 1024, 139, 1023, 179, 392, 308, 342, 1015, 96, 997, 353, 285, 154, 389, 975, 168, 1020, 265, 123, 117, 170, 155, 167, 152, 105, 374, 312, 127, 1030, 773, 314, 150, 310, 328, 395, 305, 149, 136, 134, 104, 158, 372, 329, 169, 1421, 768, 1003, 307, 767, 309, 377, 1017],
        music: [5, 1390, 51, 56, 61, 67, 186, 190, 188, 250, 493, 501, 879, 1418, 1417, 1422, 1405, 1400, 1402, 1403, 1398, 1399, 1401, 1404, 1114, 1200, 1199, 1115, 1202, 1201, 1116, 1204, 1203, 1206, 1205, 474, 473, 1035, 1117, 1208, 1207, 1118, 531, 504, 1214, 479, 478, 477, 1213, 476, 475, 315, 1489, 1473, 1472, 1471, 1210, 1209, 1439, 1505, 1453, 1452, 1451, 1450, 1449, 1445, 1448, 1506, 1442, 1443, 1440, 1447, 1446, 1444, 1441, 1212, 1211, 1198, 503, 502],
        games: [98, 355, 1381, 1057, 1053, 1050, 452, 378, 325, 318, 283, 264, 263, 262, 261, 509, 260, 508, 259, 258, 371, 1009, 1011, 1012, 1051, 359, 357, 1250, 356, 358, 734, 1052, 735],
        films: [4, 15, 193, 411, 1488, 1379, 1225, 1331, 1248, 1197, 1026, 293, 1227, 577, 298, 297, 290, 299, 230, 303, 292, 24, 1240, 304, 296, 300, 1332, 1324, 691, 301, 294, 1241, 498, 367, 574, 1226, 295, 189, 1224, 1388, 1387, 1276, 1330, 451, 412, 413, 414, 415, 416, 417, 1374, 1242, 1508, 1165, 1166, 1245, 1158, 532, 1167, 1159, 1244, 1160, 1238, 1173, 1161, 1320, 1162, 1246, 185, 496, 1164, 1163, 1172, 1243, 1386, 1312, 1277, 1237, 1420, 1036, 449, 448, 447, 537, 1170],
        cartoon: [17, 1415, 1416, 1304, 1146, 1147, 1156, 1142, 29, 85, 384, 216, 1149, 232, 455, 1148, 506, 514, 1000, 527, 237, 243, 267, 1150, 244, 239, 197, 236, 1151, 235, 1152, 241, 234, 233, 1153, 240, 1018, 1143],
        books: [195, 196, 784, 1127, 1037, 1411, 1412, 1410, 1055, 785, 1095, 1094, 1128, 1125, 1414, 1130, 999, 791, 1129, 1413, 789, 788, 1126, 1054, 786, 787, 792, 1039, 1136, 523, 518, 522, 1137, 793, 525, 524, 794, 1133, 1409, 1406, 1408, 1196, 1132, 521, 519, 1407, 1131, 520, 517, 516, 1477, 1123, 1056, 1135, 1134, 1122, 1121, 1396, 1395, 1394, 1072, 1487],
        soft: [1343, 1344, 1345, 1363, 1375, 1342, 1341, 1340, 1347, 1346, 1350, 1349, 1348, 1351, 1352, 1355, 1354, 1353, 1358, 1357, 1356, 1361, 1359, 1360, 1362, 1364, 1369, 1365, 1368, 1367, 1370, 1366],
        anime: [175, 1256, 1145, 1140, 1253, 1157, 727, 567, 1254, 219, 568, 974, 495, 743, 494, 401, 731, 499, 500, 538, 206, 1040, 446, 1005, 210, 203, 207, 204, 1255, 202, 1141],
        doc: [16, 366, 1380, 1425, 1438, 1333, 187, 1062, 1310, 1059, 1033, 1509, 1193, 1195, 1064, 1063, 1028, 1058, 1019, 490, 1397, 1065, 1419, 1194, 1070, 274, 1383, 1334, 1067, 1068, 1066, 1069, 1060, 1282, 1284, 1294, 1301, 1288, 1289, 1291, 1309, 39, 1285, 1290, 1306, 1295, 1300, 1302, 1287, 1307, 1292, 1299, 1286, 1297, 1293, 1298, 1296, 1303],
        sport: [18, 1061, 1393, 1278, 272, 284, 1308, 331, 270, 1281, 1279, 472, 1236, 343, 173, 332, 273, 268, 269, 1319, 1318, 1317, 1316, 1315, 1314, 1313],
        xxx: [],
        humor: []
    },
    search: {
        loginUrl: 'http://tfile.co',
        searchUrl: 'http://tfile.co/forum/ssearch.php',
        nextPageSelector: {selector: '.pagination a.next', attr: 'href'},
        baseUrl: 'http://tfile.co/forum/',
        requestType: 'GET',
        requestData: 'q=%search%',
        onBeforeRequest: function (details) {
            details.query = exKit.funcList.encodeCp1251(details.query);
        },
        listItemSelector: '#topics>tbody>tr',
        torrentSelector: {
            categoryTitle: 'td:eq(0)',
            categoryUrl: {selector: 'td:eq(0)>a:eq(0)', attr: 'href'},
            categoryId: {selector: 'td:eq(0)>a:eq(0)', attr: 'href'},
            title: 'td:eq(2)>a',
            url: {selector: 'td:eq(2)>a', attr: 'href'},
            size: 'td:eq(3)',
            seed: 'td:eq(4)',
            peer: 'td:eq(5)',
            date: 'td:eq(-1)'
        },
        onGetValue: {
            categoryId: function (details, value) {
                return exKit.funcList.idInCategoryListInt(details.tracker, value, /f=([0-9]+)/);
            },
            size: function (details, value) {
                return exKit.funcList.sizeFormat(value);
            },
            date: function (details, value) {
                return exKit.funcList.dateFormat(0, value)
            }
        }
    }
});