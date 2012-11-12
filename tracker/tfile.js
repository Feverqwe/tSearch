var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'tfile';
    var filename = 'tfile';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAADksgYAAAD/AAAAAACkpKUA4ODgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMzMzMzMzMzMjIyMjIyMjIzMzMzMzMzMzRERERERERERBFARAQEQABEFEBEBAQERAQUQEQEBARERBRARAQEAAAEFEBEBAQERAERAAQEBEAARBRAREQEREREFEQEBAREREREREREREREQzMzMzMzMzMzIyMjIyMjIyMzMzMzMzMzMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    var url = 'http://tfile.me/forum/search';
    var login_url = 'http://tfile.me/forum/ssearch.php';
    var root_url = 'http://tfile.me';
    var about = 'Торрент трекер tfile.me - фильмы, музыка, программы, книги';
    var flags = {
        a : 0,
        l : 1,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateSize = function (s) {
            var type = '';
            var size = s.replace(' ','');
            var t = size.replace('KB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            var t = size.replace('MB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            var t = size.replace('GB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            var t = size.replace('TB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        var calculateTime = function (time) {
            time = $.trim(time).split(" ");
            var date = time[0].split('-');
            time = time[1].split(':');
            return Math.round((new Date(parseInt(date[0]),parseInt(1+date[1])-101,parseInt('1'+date[2])-100,parseInt('1'+time[0])-100,parseInt('1'+time[1])-100)).getTime() / 1000);
        }
        var calculateCategory = function (n) {
            var n = String(n).replace(/.*c=([0-9]*)$/i,"$1");
            if (isNaN(n))
                n = String(n).replace(/.*f=([0-9]*)$/i,"$1");
            var groups_arr = [
            /* Сериалы */[37,1323,1252,697,322,323,1235,172,135,311,183,130,1024,139,1023,179,392,308,342,1015,96,997,353,285,154,389,975,168,1020,265,123,117,170,155,167,152,105,374,312,127,1030,773,314,150,310,328,395,305,149,136,134,104,158,372,329,169,1421,768,1003,307,767,309,377,1017],
            /* Музыка */[5,1390,51,56,61,67,186,190,188,250,493,501,879,1418,1417,1422,1405,1400,1402,1403,1398,1399,1401,1404,1114,1200,1199,1115,1202,1201,1116,1204,1203,1206,1205,474,473,1035,1117,1208,1207,1118,531,504,1214,479,478,477,1213,476,475,315,1489,1473,1472,1471,1210,1209,1439,1505,1453,1452,1451,1450,1449,1445,1448,1506,1442,1443,1440,1447,1446,1444,1441,1212,1211,1198,503,502],
            /* Игры */[98,355,1381,1057,1053,1050,452,378,325,318,283,264,263,262,261,509,260,508,259,258,371,1009,1011,1012,1051,359,357,1250,356,358,734,1052,735],
            /* Фильмы */[4,15,193,411,1488,1379,1225,1331,1248,1197,1026,293,1227,577,298,297,290,299,230,303,292,24,1240,304,296,300,1332,1324,691,301,294,1241,498,367,574,1226,295,189,1224,1388,1387,1276,1330,451,412,413,414,415,416,417,1374,1242,1508,1165,1166,1245,1158,532,1167,1159,1244,1160,1238,1173,1161,1320,1162,1246,185,496,1164,1163,1172,1243,1386,1312,1277,1237,1420,1036,449,448,447,537,1170],
            /* Мультфтльмы */[17,1415,1416,1304,1146,1147,1156,1142,29,85,384,216,1149,232,455,1148,506,514,1000,527,237,243,267,1150,244,239,197,236,1151,235,1152,241,234,233,1153,240,1018,1143],
            /* Книги */[195,196,784,1127,1037,1411,1412,1410,1055,785,1095,1094,1128,1125,1414,1130,999,791,1129,1413,789,788,1126,1054,786,787,792,1039,1136,523,518,522,1137,793,525,524,794,1133,1409,1406,1408,1196,1132,521,519,1407,1131,520,517,516,1477,1123,1056,1135,1134,1122,1121,1396,1395,1394,1072,1487],
            /* ПО */[1343,1344,1345,1363,1375,1342,1341,1340,1347,1346,1350,1349,1348,1351,1352,1355,1354,1353,1358,1357,1356,1361,1359,1360,1362,1364,1369,1365,1368,1367,1370,1366],
            /* Анимэ */[175,1256,1145,1140,1253,1157,727,567,1254,219,568,974,495,743,494,401,731,499,500,538,206,1040,446,1005,210,203,207,204,1255,202,1141],
            /* Док. и юмор */[16,366,1380,1425,1438,1333,187,1062,1310,1059,1033,1509,1193,1195,1064,1063,1028,1058,1019,490,1397,1065,1419,1194,1070,274,1383,1334,1067,1068,1066,1069,1060,1282,1284,1294,1301,1288,1289,1291,1309,39,1285,1290,1306,1295,1300,1302,1287,1307,1292,1299,1286,1297,1293,1298,1296,1303],
            /* Спорт */[18,1061,1393,1278,272,284,1308,331,270,1281,1279,472,1236,343,173,332,273,268,269,1319,1318,1317,1316,1315,1314,1313]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(n),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var readCode = function (c) {
            try {
                c = view.contentFilter(c).replace(/scr\'\+\'ipt/img,'#blockscr#');
            } catch(err) {
                view.auth(0,id);
                return [];
            }
            var t = $(c);
            var ex = false;
            for (var tmp_n = 0;tmp_n<t.length;tmp_n++) {
                if ($(t[tmp_n]).attr('id')=='topics')
                {
                    t = $(t[tmp_n]).children('tbody').children('tr');
                    ex = true;
                    break;
                }
            }
            if (!ex) {
                view.auth(0,id);
                return [];
            } else {
                view.auth(1,id);
            }
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 1;i<l;i++) {
                var td = t.eq(i).children('td');
                td.eq(6).children('nobr').remove();
                if (t.eq(i).children('td.dl').children().length == 0) continue;
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(0).text(),
                        'url' : root_url+td.eq(0).children('a').eq(0).attr('href'),
                        'id': calculateCategory(td.eq(0).children('a').eq(0).attr('href'))
                    },
                    'title' : td.eq(2).children('a').text(),
                    'url' : root_url+td.eq(2).children('a').attr('href'),
                    'size' : calculateSize(td.eq(3).children('a').text()),
                    'dl' : root_url+td.eq(3).children('a').attr('href'),
                    'seeds' : td.eq(3).children('b.sd').text(),
                    'leechs' : td.eq(3).children('b.lc').text(),
                    'time' : 0
                }
            }
            return arr;
        }
        var encode = function (sValue) {
            var    text = "", Ucode, ExitValue, s;
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
                else if (Ucode == 10){
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
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'GET',
                url: url+'?q='+encode(text)+'&f=0&g=&ql=&a=&d=&io=1&o=&size_min=0&size_max=0',
                cache : false,
                success: function(data) {
                    view.result(id,readCode(data),t);
                },
                error:function (){
                    view.loadingStatus(2,id);
                }
            });
        }
        return {
            getPage : function (a) {
                return loadPage(a);
            }
        }
    }();
    var find = function (text) {
        return web.getPage(text);
    }
    return {
        find : function (a) {
            return find(a);
        },
        setId : function (a) {
            id = a;
        },
        login_url : login_url,
        id : id,
        name : name,
        icon : icon,
        about : about,
        url : root_url,
        filename : filename,
        flags : flags
    }
}();
engine.ModuleLoaded(tmp_num);