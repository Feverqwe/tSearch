/**
 * Created by Anton on 24.05.2015.
 */
engine.trackerLib.underverse = {
    id: 'underverse',
    title: 'Underverse',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAEMD1saDA9iSAsPVmQICjx9BQgxiRYWN4FISUtpYV5YUEdFQjIODQwOAAAAAgAAAAAAAAAAAAAAAgAAAAYAAAARAAAAKAsLOIAhIYrhQkDK+1RS0/2imbH3mpKO6GdiYK4EBARFAAAAIgAAAA0AAAAEAAAAAQAAAAIAAAAIAAAAGx0eo5U8PN76SUrl/k9S7P9jZfP/iov2/+/t+P//+ff/6N/c73Ruam8AAAAnAAAADgAAAAIAAAACAAAABygqwoRFRuP3Nzni/yks5/9HSvH/T1P0/1FX9v9aX/f/4934//759v7u4971WVNShQAAACEAAAACAAAAASIkmixCROTvJCbc/hof4P8wNer/QUbu/zI57v8uNe//Lzbw/zU+8v/o4/P//O/p/ZCKiu8lJCRnAAAABAAAAAQvM9CQJSfd/Rof2/8eJOD/KzHm/ygv5/8aIuf/Exvo/xQe6f8wOev/7ubu//fn4f96d3j7Z19f1gMDAxUAAAAKJine2B0j2/4fJdz/GiHe/xoj4v8aJOL/GiLi/xgg4v9DS+T/1tHl//Hm4f+ompX/MTE1/VBQVfI1NTU3AgVMFiUt4OofJ9z/GSHb/xQb2/8pMt7/KzTe/zhA3v+Ymt//3dvd/9fRzf+MhoP/QkJF/zMzOP5HR073cXByVAECHhE7QuPfISnd/hEa2v80PN3/QEje/3R42//Ozdn/u7u7/4mIiP5eXl7/WVla/1tbXv5QUFT9TExT8ZOTlUoAAAAIUVfhshsm3vwTHt7+a3Lg/7Kw3P/BvLr/jo2N/nNzc/5wcG/9bm5u/nBwcf50dHf9eHh89l1dY9aqqastAAAAAnd72Vs6ReftISve/drU3v6sqaf/lZWV/pCQkPyMjIv7iYmJ/YiIif6Li4z+j4+S9pOTluORkZaUl5eZEAAAAABcX4MOmaP4xoGC6Pnl3tT+rq6u/K2trP2pqan8pqam/6SkpP+lpaX+qKip/aqqq/OurrGprayvLwAAAAAAAAAAAAAAAdHR82nEy/vc+/fw+NHR0vXGxsb1wcHB9cDAwPfBwcH4w8PD9sTExfLExMWrsbGzL3Z2eAkAAAAAAAAAAAAAAAEAAAAB6ejvZfv6/MH+/f3c6uvs4uDg4OLd3d3h3Nzc2Nvb3M7d3d2a1tbWNIODhgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALRzckj/fz8lf/+/sT+/v7A/Pz8pfb29oj09PVezMvMJ42NjgwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoaGhAdDQ0AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/n8AAPAfAADgDwAAwAMAAMADAACAAQAAgAEAAIABAACAAQAAgAEAAMABAADAAwAA4AcAAPAPAAD4P////////w%3D%3D',
    desc: 'Торрент трекер Underverse.su - У нас можно скачать бесплатно фильмы, сериалы, музыку mp3 и lossless, игры, книги, софт, доступно скачивание торрентов без регистрации.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: {
        serials: [6, 38, 39, 628, 747, 749],
        music: [536, 545, 546, 541, 542, 748, 145, 146, 147, 148, 149, 150, 151, 152, 154, 155, 156, 157, 969, 820, 646, 158, 159, 160, 822, 647, 161, 163, 165, 166, 168, 169, 179, 170, 172, 173, 171, 175, 182, 177, 180, 181, 183, 185, 187, 186, 174, 176, 178, 167, 184, 188, 189, 190, 192, 193, 194, 195, 196, 197, 198, 199, 201, 202, 203, 204, 205, 206, 207, 208, 209, 211, 212, 213, 214, 215, 216, 218, 219, 220, 221, 223, 224, 694, 225, 222, 227, 228, 229, 230, 231, 232, 233, 234, 236, 237, 239, 240, 241, 242, 243, 244, 245, 247, 248, 706, 249, 250, 252, 253, 255, 254, 256, 257, 258, 260, 261, 262, 263, 821, 648, 265, 266, 823, 649, 267, 264, 269, 270, 272, 273, 274, 281, 275, 277, 278, 276, 279, 284, 280, 282, 283, 285, 286, 287, 288, 289, 290, 291, 292, 294, 295, 296, 297, 298, 299, 300, 301, 303, 304, 305, 306, 307, 308, 309, 310, 312, 313, 314, 315, 316, 317, 318, 320, 321, 322, 323, 324, 325, 326, 327, 328, 330, 331, 332, 333, 334, 335, 336, 337, 339, 340, 341, 343, 731, 344, 345, 346, 347, 348, 350, 351, 352, 726, 754, 755, 756, 757, 758, 759, 760, 761, 762, 763, 764],
        games: [356, 357, 358, 736, 360, 361, 363, 364, 365, 367, 368, 369, 370, 372, 373, 374, 375, 376, 734, 650, 652, 735, 733, 651, 381, 383, 387, 385, 388, 392, 396, 398, 537, 548, 549, 727],
        films: [15, 2, 704, 16, 17, 18, 19, 3, 23, 24, 25, 4, 29, 30, 31, 32, 34, 35, 5, 378, 379, 380, 382, 386, 97, 98, 99, 100, 125, 109, 103, 104, 105, 106, 126, 110, 118, 119, 128, 120, 121, 122, 129, 743, 744, 745, 746, 751, 752],
        cartoon: [33, 7, 738, 41, 739, 42, 44, 43, 740],
        books: [629, 630, 631, 632, 633, 539, 554, 555, 556, 557, 625, 563, 564, 565, 566, 567, 846, 569, 570, 571, 572, 955, 795, 574, 573, 575, 577, 678, 673, 674, 675, 676, 677, 679, 680, 578, 682, 568, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 952, 725, 766, 767, 768, 769],
        soft: [538, 551, 552, 436, 437, 438, 439, 968, 440, 441, 443, 444, 655, 445, 446, 448, 449, 450, 451, 452, 453, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 480, 481, 482, 483, 484, 485, 802, 803, 804, 805, 487, 488, 489, 490, 491, 492, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 530, 580, 583, 585, 586, 618, 582, 587, 532, 534],
        anime: [8, 48, 623, 775, 50, 785, 776, 49, 786, 779, 53, 777, 55, 699, 783, 784, 54, 778, 51, 700, 781],
        doc: [9, 58, 59, 60, 61, 62, 63, 64, 65, 66, 75, 11, 78, 81, 79, 80, 82, 83, 111, 112, 113, 114, 127, 115, 750],
        sport: [10, 69, 943, 742, 70, 71, 964, 72, 73, 702, 74, 671, 836, 837, 838],
        xxx: [52, 695, 782],
        humor: []
    },
    search: {
        searchUrl: 'http://underverse.su/tracker.php',
        nextPageSelector: {selector: '.bottom_info div.nav a:eq(-1)', attr: 'href'},
        baseUrl: 'http://underverse.su/',
        requestType: 'GET',
        requestData: 'nm=%search%',
        requestMimeType: 'text/html; charset=windows-1251',
        onBeforeRequest: function (details) {
            "use strict";
            details.query = exKit.funcList.encodeCp1251(details.query);
        },
        listItemSelector: '#tor-tbl>tbody>tr',
        torrentSelector: {
            categoryTitle: 'td:eq(2)>a',
            categoryUrl: {selector: 'td:eq(2)>a', attr: 'href'},
            categoryId: {selector: 'td:eq(2)>a', attr: 'href'},
            title: 'td.row4.med.tLeft>a:eq(1)',
            url: {selector: 'td.row4.med.tLeft>a:eq(1)', attr: 'href'},
            size: 'td.row4.small.nowrap:eq(0)>u',
            downloadUrl: {selector: 'td.row4.small.nowrap:eq(0)>a', attr: 'href'},
            seed: 'td.seedmed',
            peer: 'td.leechmed',
            date: 'td.row4.small.nowrap:eq(1)>u'
        },
        onGetValue: {
            categoryId: function (details, value) {
                "use strict";
                return exKit.funcList.idInCategoryListInt(details.tracker, value, /f=([0-9]+)/);
            }
        }
    }
};