// ==UserScript==
// @name NoNaMe
// @trackerURL http://nnm-club.me
// @icon data:image/x-icon;base64,AAABAAEAEBAAAAEACABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAQAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAg0k9AHweEwCYQh4AAIAAAIB1fgAAAIAAwL26AOPi3gDv6OEAsX1xAPPz7wD7lycA+MAmAAD/AAD79u0AAAD/APv48AD9+/AAs6GQAPv37QD08OgA+/jxAN/c1gDa3doA/vz2AP789AD/++8A3sq9AABilgAASnMAADJQAP///QD68+gA9PPzAO7p4AD89u8A///6AABV/wAASdwAAD25AAAxlgAAJXMAABlQAO/q4QD07+UAopWVAP/++gD9+O8AJSX/AAAA/wAAANwAAAC5AAAAlgAAAHMAAABQAPn37wD//vwA+fbzAPTx6AD//vgA/vjsAFUA/wBJANwAPQC5ADEAlgAlAHMAGQBQAPPu5gD38+YA//7xAM7HxAD/+vAA//70AP767wD58OUA/fnuAGIAlgBKAHMAMgBQAP///wD79+4A//30AP369AD8/PoA+vXqAP778QD++e8Aua6hAJeHiAB3bG8AblpaAP/+9gDu590A+vTqAPnz6gC7qaYA39W9AOrIogDDmXkAsZB5AJ5oUwCUPCEAUjk/APbx6QD38ugA9/f1ALWSiwD2ZiAA96wrAMx4WADMWyQApVMuAKVEKgB4LyoAYRoPAN/a0wDx7eIA7ejgAL5+YADHhlkA4JovAOKILgDaNBkAxmQkAJQ3FwBuHhEAUAAAAOHc1AD++fAA+/XrANKIZwDSciUA+n8eANN+JADNYCYAsEAvAIcsJgCDLBkAWhYMAOrl3ADv6OAA8e3lAPjy6ADosCwAyoAnAPS1LQDZmEEAum8oAKNUGwCfPBcAbi4jAP788gD8+fEA/frwAP//8QD8+O8A9r4wAPzJLwDpoS0AzqoyAMSGQQB1SyQAsU8kAPjz6gD///wA9vPnAPn47wDuqDcA760qAP/kMwDspisAvoMqANONHwDGah0AMlAAAOLd1gD///4A/PfuANbNwwDiujkA+848AP/mMADyyjIA/q0eAO+QLwDabCYAGVAAANrZ1AD9+vUAzMjEAPa+OQD+yDAA9MkxAAD/AAAA3AAAALkAAACWAAAAcwAAAFAAAPbx6gD+/PAA/PjwAO7o4QD89usA///4AP/88wAA3EkA0qlTAPO4MgDUmygAAFAZAPv17AD++O8A9fDmAOzo3gDm4toA//vwAP/67gDgzLkAALl6ALyWYQDCbj8AAFAyAP//+wD//vkA//73AP//+QD7+/UA+fTqAP/67wD27+QA6becAACWlgCRe2cAAFBQAPby6wDl4doA3drQAOHc0gDcwLcA2bSlAOfc1ACon6AAm5mfAK+HcQCrfEwAnHNsAHtgXACJUEgAkkU5AHpFPACNNB0AfUUwABkJGwAODg4ApaWlpaWl2xylpaWlpaWlpaWlpaWlWNHS3uilpaWlpaWlpaWlpeq2wbq556WlpaWlpaWlpaVbt7/A0GFipaWlpbP9AQUYWXqqtN21uGOlpaVkrams+2ejrmZvq20MbmDYZYZ5qJ6i/pd+i3P8fGx7WncCfZ8NA/QXRy74+aF4a77y9fagnXClpaWlpaWlpaWlpfFxkJL6paWlpaWlpaWlpaWDlpGE96WlpeDg4OBQ46Wl8IqUh/OlpaXg4ODgUKWlpaVylZMIpaWl4ODgsVClpaWliIUTjaWlpeHg4CBQpaWlpYkKpaWlpaWlpVBQUKUgpaUHpaWlpaWlpaWlpaWlUAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8%3D
// @description Торрент-трекер NNM-Club.me. Игры, фильмы, музыка mp3 и lossless, программы, отечественные и зарубежные сериалы, книги, мультфильмы и аниме. Рекомендации, обсуждение, рецензии и рейтинги.
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/nnmclub.js
// @connect *://nnm-club.me/*
// @require exKit
// @version 1.0.3
// ==/UserScript==

API_exKit({
    version: 2,
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1
    },
    categoryList: {
        serials: [1221, 1220, 768, 779, 778, 788, 787, 1196, 1141, 777, 786, 803, 776, 785, 775, 774, 1140, 782, 773, 1142, 784, 1195, 772, 771, 783, 1144, 804, 781, 780, 922, 770, 769, 799, 800, 791, 798, 797, 790, 793, 794, 789, 796, 792, 795, 802],
        music: [304, 734, 742, 313, 680, 1149, 429, 1234, 681, 330, 398, 370, 371, 375, 374, 373, 372, 376, 377, 326, 359, 358, 1188, 1189, 357, 328, 1180, 1181, 364, 363, 1179, 879, 322, 962, 333, 965, 336, 337, 338, 963, 334, 961, 332, 325, 1165, 1166, 1167, 1168, 1162, 352, 1164, 1163, 1161, 353, 324, 976, 346, 977, 345, 349, 978, 347, 979, 673, 1224, 1225, 671, 980, 672, 981, 344, 983, 984, 982, 348, 674, 323, 1187, 339, 1186, 340, 1185, 341, 329, 369, 368, 1218, 365, 1217, 366, 1215, 1216, 1213, 367, 331, 1157, 711, 1159, 378, 1160, 876, 1158, 379, 380, 1178, 361, 360, 327, 1184, 824, 1182, 354, 877, 1183, 1190, 917, 1096, 1097, 147, 92],
        games: [935, 871, 973, 960, 740, 741, 410, 411, 412, 1008, 415, 746, 428, 1009, 413, 414, 1010, 1012, 1014, 416, 1013, 1015, 268, 1016, 1041, 1018, 1017, 1146, 418, 1061, 1060, 1059, 1058, 1057, 1056, 1054, 1053, 1052, 1051, 1050, 1049, 1048, 1047, 417, 1193, 1192, 382, 390, 387, 388, 385, 386, 848, 383, 384, 389, 391, 833, 835, 836, 837, 1039, 1038, 1037, 1036, 1035, 1034, 822, 834, 148, 93],
        films: [731, 733, 216, 270, 218, 219, 954, 888, 217, 266, 318, 320, 677, 1177, 319, 678, 885, 908, 909, 910, 911, 912, 220, 221, 222, 882, 889, 224, 225, 226, 227, 891, 682, 694, 884, 1211, 693, 913, 228, 1150, 254, 321, 255, 906, 256, 257, 258, 883, 955, 905, 271, 1210, 272, 1155, 1156, 1099, 1098, 668],
        cartoon: [730, 732, 230, 659, 658, 231, 660, 661, 890, 232, 892],
        books: [735, 738, 967, 907, 739, 1109, 432, 755, 481, 557, 442, 441, 875, 444, 443, 440, 1199, 558, 433, 447, 445, 817, 818, 434, 456, 931, 1152, 957, 455, 1153, 453, 452, 449, 1063, 451, 438, 485, 473, 472, 471, 895, 470, 896, 480, 482, 484, 483, 436, 460, 459, 458, 457, 462, 437, 467, 466, 958, 465, 464, 463, 1223, 469, 439, 477, 476, 475, 474, 886, 478, 486, 490, 657, 489, 488, 487, 1198, 887, 1227, 893, 491, 767, 299, 301, 300, 435, 662, 663, 461, 1226, 492, 1170, 1176, 1174, 1173, 1171, 1175, 1172, 815, 933, 816, 1095, 161, 94],
        soft: [503, 504, 506, 763, 1023, 717, 509, 508, 510, 1042, 511, 916, 512, 561, 562, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 532, 533, 535, 530, 529, 525, 526, 527, 545, 764, 765, 820, 552, 553, 554, 550, 549, 548, 536, 563, 1032, 1031, 1025, 1026, 564, 1137, 830, 839, 1233, 1236, 832, 829, 828, 1231, 840, 1232, 841, 1238, 537, 538, 1151, 1083, 1029, 1082, 1028, 1087, 1030, 1093, 1092, 1091, 831, 149, 95],
        anime: [615, 616, 617, 619, 620, 623, 622, 635, 621, 632, 643, 624, 627, 626, 636, 625, 633, 644, 628, 631, 630, 637, 629, 634, 642, 645, 639, 640, 648, 638, 646, 696, 695, 146, 169],
        doc: [713, 706, 577, 894, 578, 580, 579, 953, 581, 806, 714, 761, 809, 924, 812, 576, 590, 591, 588, 823, 589, 598, 652, 596, 600, 819, 599, 956, 959, 597, 594, 593, 595, 582, 587, 583, 584, 586, 585, 614, 669],
        sport: [603, 1206, 1200, 1194, 1062, 974, 609, 951, 975, 608, 607, 606, 750, 605, 604, 950],
        xxx: [],
        humor: [610, 613, 612, 655, 654, 611, 656, 399, 400]
    },
    search: {
        searchUrl: 'http://nnm-club.me/forum/tracker.php',
        nextPageSelector: {selector: 'table td[align="right"] .nav a:eq(-1)', prop: 'href'},
        baseUrl: 'http://nnm-club.me/forum/',
        requestType: 'GET',
        requestData: 'nm=%search%&f=-1',
        requestMimeType: 'text/html; charset=windows-1251',
        listItemSelector: 'table.forumline.tablesorter>tbody>tr',
        torrentSelector: {
            categoryTitle: 'td:eq(1)>a',
            categoryUrl: {selector: 'td:eq(1)>a', prop: 'href'},
            categoryId: {selector: 'td:eq(1)>a', prop: 'href'},
            title: 'td.genmed>a',
            url: {selector: 'td.genmed>a', prop: 'href'},
            size: 'td.gensmall:eq(0)>u',
            downloadUrl: {selector: 'td:eq(4)>a', prop: 'href'},
            seed: 'td.seedmed',
            peer: 'td.leechmed',
            date: 'td.gensmall:eq(-1)>u'
        },
        onGetValue: {
            categoryId: function (details, value) {
                return exKit.funcList.idInCategoryListInt(details.tracker, value, /f=([0-9]+)/);
            }
        }
    }
});
