// ==UserScript==
// @name Rustorka
// @trackerURL http://rustorka.com
// @icon data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAQABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIH/8QAJhAAAQQBBAAGAwAAAAAAAAAAAQIDBAURABIhMQYTFBUicUFCUf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAWEQADAAAAAAAAAAAAAAAAAAAAESL/2gAMAwEAAhEDEQA/ANIk28uzQ/CpmnGpKFBt155IT6YH9tpOScZxxjVwrp9p+PWWsZabBwdtAKQsA438HKR9jjR2FDYSPEnusKxbhAwxHUQwHFn57jjPA/HefrSU1JMgW8+wnTGpjkptpCXEs+WoBG7ORkjnI6/nWllB0z//2Q==
// @description Торрент-трекер.
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/rustorka.js
// @connect *://rustorka.com/*
// @require exKit
// @version 1.0.0
// ==/UserScript==

API_exKit({
    id: 'rustorka',
    title: 'Rustorka',
    icon: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAQABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIH/8QAJhAAAQQBBAAGAwAAAAAAAAAAAQIDBAURABIhMQYTFBUicUFCUf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAWEQADAAAAAAAAAAAAAAAAAAAAESL/2gAMAwEAAhEDEQA/ANIk28uzQ/CpmnGpKFBt155IT6YH9tpOScZxxjVwrp9p+PWWsZabBwdtAKQsA438HKR9jjR2FDYSPEnusKxbhAwxHUQwHFn57jjPA/HefrSU1JMgW8+wnTGpjkptpCXEs+WoBG7ORkjnI6/nWllB0z//2Q==',
    desc: 'Торрент-трекер.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1
    },
    categoryList: {
        serials: [161, 160],
        music: [451, 452, 453, 454, 455, 457, 458, 459, 460, 461, 463, 464, 465, 466, 467, 469, 470, 471, 472, 473, 474, 475, 477, 478, 479, 480, 481, 483, 484, 485, 486, 487, 488, 489, 490, 492, 493, 494, 496, 497, 498, 499, 500, 501, 502, 504, 505, 506, 507, 508, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 402, 403, 399, 401, 404, 400, 535, 536, 537, 538, 539, 540, 541, 542, 543, 545, 546, 547],
        games: [2, 14, 314, 13, 12, 11, 10, 9, 712, 18, 808, 809, 810, 811, 812, 813, 814, 815, 24, 25, 28, 27, 26, 238, 19, 23, 22, 21, 20, 29, 31, 34, 33, 32, 30, 35, 39, 38, 37, 36, 40, 44, 45, 46, 47, 60, 59, 58, 57, 56, 53, 55, 52, 54, 48, 49, 51, 69, 86, 817, 646, 87, 89, 612, 614, 88, 85, 70, 689, 818, 696, 102, 103, 104, 435, 105, 690, 178, 101, 78, 148, 116, 115, 381, 382, 349, 350, 351, 352, 390],
        films: [429, 703, 430, 431, 74, 144, 121, 122, 123, 124, 145, 146, 149, 150, 151, 152, 126, 75, 127, 128, 130, 131, 133, 135, 156, 635],
        cartoon: [320, 324, 325, 326, 327, 328, 329, 330, 321, 162, 392],
        books: [717, 740, 738, 739, 836, 838, 837, 843, 713, 724, 728, 725, 727, 723, 721, 722, 844, 718, 715, 839, 719, 846, 840, 842, 841, 716, 714, 845, 741],
        soft: [202, 203, 204, 205, 206, 207, 208, 215, 216, 217, 227, 228, 229, 230, 701, 698, 231, 232, 236, 237, 240, 239, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 409, 607, 593, 595, 594, 257, 258, 259, 260, 261, 262, 263, 264, 265, 268, 269, 270, 271, 272, 273, 274, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 290, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 597, 600, 599, 601, 623, 624, 625, 626, 627, 628, 622, 667, 668, 669, 670, 672, 671, 639, 640, 642],
        anime: [693, 684, 677, 96, 678, 660, 95, 106, 109, 107, 685, 687, 686, 688],
        doc: [],
        sport: [830, 827, 835, 831, 832, 833, 834],
        xxx: [41, 43, 42, 50, 763, 680, 681, 682, 683, 697],
        humor: []
    },
    search: {
        loginUrl: 'http://rustorka.com/forum/login.php',
        searchUrl: 'http://rustorka.com/forum/tracker.php',
        nextPageSelector: {selector: '.menu-root a:eq(-1)', attr: 'href'},
        baseUrl: 'http://rustorka.com/',
        requestType: 'GET',
        requestData: 'nm=%search%',
        requestMimeType: 'text/html; charset=windows-1251',
        onBeforeRequest: function (details) {
            details.query = exKit.funcList.encodeCp1251(details.query);
        },
        onAfterRequest: function (details) {
            if (/login\.php/.test(details.responseUrl)) {
                details.result = {requireAuth: 1};
            }
        },
        listItemSelector: '#tor-tbl>tbody>tr',
        torrentSelector: {
            categoryTitle: 'td:eq(2)>a',
            categoryUrl: {selector: 'td:eq(2)>a', attr: 'href'},
            categoryId: {selector: 'td:eq(2)>a', attr: 'href'},
            title: 'td.med.tLeft>a',
            url: {selector: 'td.med.tLeft>a', attr: 'href'},
            size: 'td.small.nowrap:eq(0)>u',
            downloadUrl: {selector: 'td.small.nowrap:eq(0)>a', attr: 'href'},
            seed: 'td.seedmed',
            peer: 'td.leechmed',
            date: 'td.small.nowrap:eq(1)>u'
        },
        onGetValue: {
            categoryId: function (details, value) {
                return exKit.funcList.idInCategoryListInt(details.tracker, value, /f=([0-9]+)/);
            }
        }
    }
});