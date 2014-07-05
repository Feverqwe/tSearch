torrent_lib['nnm-club'] = function () {
    var name = 'NoNaMe';
    var filename = 'nnm-club';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEACABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAQAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAg0k9AHweEwCYQh4AAIAAAIB1fgAAAIAAwL26AOPi3gDv6OEAsX1xAPPz7wD7lycA+MAmAAD/AAD79u0AAAD/APv48AD9+/AAs6GQAPv37QD08OgA+/jxAN/c1gDa3doA/vz2AP789AD/++8A3sq9AABilgAASnMAADJQAP///QD68+gA9PPzAO7p4AD89u8A///6AABV/wAASdwAAD25AAAxlgAAJXMAABlQAO/q4QD07+UAopWVAP/++gD9+O8AJSX/AAAA/wAAANwAAAC5AAAAlgAAAHMAAABQAPn37wD//vwA+fbzAPTx6AD//vgA/vjsAFUA/wBJANwAPQC5ADEAlgAlAHMAGQBQAPPu5gD38+YA//7xAM7HxAD/+vAA//70AP767wD58OUA/fnuAGIAlgBKAHMAMgBQAP///wD79+4A//30AP369AD8/PoA+vXqAP778QD++e8Aua6hAJeHiAB3bG8AblpaAP/+9gDu590A+vTqAPnz6gC7qaYA39W9AOrIogDDmXkAsZB5AJ5oUwCUPCEAUjk/APbx6QD38ugA9/f1ALWSiwD2ZiAA96wrAMx4WADMWyQApVMuAKVEKgB4LyoAYRoPAN/a0wDx7eIA7ejgAL5+YADHhlkA4JovAOKILgDaNBkAxmQkAJQ3FwBuHhEAUAAAAOHc1AD++fAA+/XrANKIZwDSciUA+n8eANN+JADNYCYAsEAvAIcsJgCDLBkAWhYMAOrl3ADv6OAA8e3lAPjy6ADosCwAyoAnAPS1LQDZmEEAum8oAKNUGwCfPBcAbi4jAP788gD8+fEA/frwAP//8QD8+O8A9r4wAPzJLwDpoS0AzqoyAMSGQQB1SyQAsU8kAPjz6gD///wA9vPnAPn47wDuqDcA760qAP/kMwDspisAvoMqANONHwDGah0AMlAAAOLd1gD///4A/PfuANbNwwDiujkA+848AP/mMADyyjIA/q0eAO+QLwDabCYAGVAAANrZ1AD9+vUAzMjEAPa+OQD+yDAA9MkxAAD/AAAA3AAAALkAAACWAAAAcwAAAFAAAPbx6gD+/PAA/PjwAO7o4QD89usA///4AP/88wAA3EkA0qlTAPO4MgDUmygAAFAZAPv17AD++O8A9fDmAOzo3gDm4toA//vwAP/67gDgzLkAALl6ALyWYQDCbj8AAFAyAP//+wD//vkA//73AP//+QD7+/UA+fTqAP/67wD27+QA6becAACWlgCRe2cAAFBQAPby6wDl4doA3drQAOHc0gDcwLcA2bSlAOfc1ACon6AAm5mfAK+HcQCrfEwAnHNsAHtgXACJUEgAkkU5AHpFPACNNB0AfUUwABkJGwAODg4ApaWlpaWl2xylpaWlpaWlpaWlpaWlWNHS3uilpaWlpaWlpaWlpeq2wbq556WlpaWlpaWlpaVbt7/A0GFipaWlpbP9AQUYWXqqtN21uGOlpaVkrams+2ejrmZvq20MbmDYZYZ5qJ6i/pd+i3P8fGx7WncCfZ8NA/QXRy74+aF4a77y9fagnXClpaWlpaWlpaWlpfFxkJL6paWlpaWlpaWlpaWDlpGE96WlpeDg4OBQ46Wl8IqUh/OlpaXg4ODgUKWlpaVylZMIpaWl4ODgsVClpaWliIUTjaWlpeHg4CBQpaWlpYkKpaWlpaWlpVBQUKUgpaUHpaWlpaWlpaWlpaWlUAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8%3D';
    var url = 'http://nnm-club.me/forum/tracker.php';
    var root_url = 'http://nnm-club.me/forum/';
    var about = 'Торрент-трекер NNM-Club.me. Игры, фильмы, музыка mp3 и lossless, программы, отечественные и зарубежные сериалы, книги, мультфильмы и аниме. Рекомендации, обсуждение, рецензии и рейтинги.';
    var flags = {
        a: 1,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[802, 496, 683, 573, 501, 919, 566, 498, 985, 720, 987, 664, 497, 721, 719, 849, 949, 665, 986, 666, 722, 920, 570, 499, 768, 779, 778, 788, 787, 777, 786, 803, 776, 785, 775, 774, 773, 784, 772, 771, 783, 804, 782, 781, 780, 922, 770, 769, 799, 800, 801, 791, 798, 797, 790, 793, 794, 789, 796, 792, 795],
                /* Музыка */[92, 726, 742, 256, 257, 258, 883, 955, 905, 271, 304, 322, 962, 333, 965, 336, 337, 338, 963, 334, 961, 332, 323, 343, 342, 341, 340, 339, 324, 976, 346, 977, 345, 349, 978, 347, 979, 673, 671, 980, 672, 981, 344, 983, 984, 982, 348, 674, 877, 350, 351, 325, 356, 355, 354, 353, 352, 712, 326, 359, 358, 357, 328, 364, 362, 363, 879, 824, 329, 369, 368, 367, 366, 365, 330, 398, 370, 371, 375, 374, 373, 372, 376, 377, 313, 680, 429, 681, 331, 380, 711, 379, 378, 876, 917, 327, 361, 360],
                /* Игры */[93, 728, 740, 741, 410, 411, 412, 1008, 415, 746, 428, 1009, 413, 414, 1010, 1012, 1014, 416, 1013, 1015, 268, 1016, 1041, 1018, 1017, 972, 971, 970, 969, 968, 418, 1061, 1060, 1059, 1058, 1057, 1056, 1054, 1053, 1052, 1051, 1050, 1049, 1048, 1047, 1046, 1045, 1044, 417, 316, 1039, 1038, 1037, 1036, 1035, 1034, 822, 382, 390, 387, 388, 385, 386, 848, 383, 384, 389, 391],
                /* Фильмы */[668, 724, 306, 725, 729, 731, 733, 216, 270, 218, 219, 954, 888, 217, 266, 318, 320, 677, 319, 678, 885, 908, 909, 910, 911, 912, 220, 221, 222, 882, 889, 224, 225, 226, 227, 891, 682, 694, 884, 693, 913, 228, 254, 321, 255, 906],
                /* Мультфтльмы */[892, 229, 730, 732, 230, 659, 658, 231, 660, 661, 890, 232],
                /* Книги */[94, 735, 734, 727, 738, 967, 907, 739, 736, 737, 898, 935, 871, 973, 960, 432, 755, 481, 557, 442, 441, 875, 444, 443, 440, 558, 433, 447, 445, 817, 818, 434, 456, 931, 957, 455, 453, 452, 449, 1063, 451, 482, 484, 483, 436, 460, 459, 458, 457, 462, 437, 467, 466, 958, 465, 464, 463, 469, 438, 485, 473, 472, 471, 895, 470, 896, 480, 439, 477, 476, 475, 474, 886, 478, 486, 490, 657, 489, 488, 487, 887, 893, 491, 767, 299, 301, 300, 435, 662, 663, 461, 492, 815, 933, 816],
                /* ПО */[95, 503, 504, 506, 763, 1023, 717, 509, 508, 510, 1042, 511, 916, 512, 561, 562, 513, 514, 516, 517, 518, 519, 520, 521, 522, 523, 532, 533, 535, 534, 530, 529, 525, 526, 527, 545, 764, 765, 820, 552, 553, 554, 550, 549, 548, 536, 563, 1032, 1031, 1025, 1026, 564, 1024, 537, 538, 1029, 539, 1028, 1030],
                /* Анимэ */[169, 615, 619, 618, 617, 616, 620, 623, 622, 621, 635, 632, 624, 627, 626, 625, 636, 633, 628, 631, 630, 629, 637, 634, 638, 640, 639, 641, 644, 643, 642, 645, 651, 649, 648, 646, 647, 650, 695, 696],
                /* Док. и юмор */[669, 400, 713, 706, 577, 894, 578, 580, 579, 953, 581, 806, 714, 761, 809, 924, 812, 576, 590, 591, 588, 823, 589, 598, 652, 596, 600, 819, 599, 956, 959, 597, 594, 593, 595, 582, 587, 583, 584, 586, 585, 614, 610, 613, 612, 655, 653, 654, 611, 656],
                /* Спорт */[603, 1062, 974, 609, 951, 975, 608, 607, 606, 750, 605, 604, 950],
                /* XXX */[]
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
            t = t.find('table[class="forumline tablesorter"]').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var td = t.eq(i).children('td');
                var f = 0;
                if (td.length === 11)
                    f = 1;
                if (td.eq(4).children('a').attr('href') === undefined) {
                    continue;
                }
                arr.push({
                    category: {
                        title: td.eq(1).children('a').text(),
                        url: root_url + td.eq(1).children('a').attr('href'),
                        id: calculateCategory(td.eq(1).children('a').attr('href').replace(/.*f=([0-9]*).*$/, '$1'))
                    },
                    title: td.eq(2).children('a').text(),
                    url: root_url + td.eq(2).children('a').attr('href'),
                    size: td.eq(5).children('u').text(),
                    dl: root_url + td.eq(4).children('a').attr('href'),
                    seeds: td.eq(6 + f).children('b').text(),
                    leechs: td.eq(7 + f).children('b').text(),
                    time: td.eq(9 + f).children('u').text()
                });
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr != undefined)
                xhr.abort();
            xhr = engine.ajax({
                mimeType: "text/plain; charset=windows-1251",
                type: 'GET',
                url: url + '?nm=' + encodeURIComponent(text) + '&f[]=-1&prev_sd=0&prev_a=0&prev_my=0&prev_n=0&prev_shc=0&prev_shf=1&prev_sha=1&prev_shs=0&prev_shr=0&prev_sht=0&f[]=-1&o=1&s=2&tm=-1&shf=1&sha=1&ta=-1&sns=-1&sds=-1',
                cache: false,
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