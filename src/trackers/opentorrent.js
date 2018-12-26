// ==UserScript==
// @name OpenTorrent
// @trackerURL https://izhtorrent.ru
// @icon data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AkeBics+G6WHQAAAf9JREFUOMulk0tI1FEUh7878x8fmUVJCL3ICIKM3hRF0YuYVbQrilZBpJtCCo0e4KKFBRZC4iZBW5op4SwMCUZTKVBo0TsEdYrSqRB1nHHm/v+/FmpkOQj5Lc+59zv3XM4xksQC8M0VlIS8UVz3+/8JhmMhrj/L5/H78/MKzEwLkjDG8OjNcULvQsSTDtkZltvBZvIXn8AYk/4FkrAaoKRlJbUvQ6zIhUTKEk861PZcSnsZwAEwxlDWeoCkN0LruVEgQMfAfaqeXyXgg7sRqOuz/O0pXDYtmLDDVPd+JnrlKWVtRzi8LkimswTXEyc3lVFQZ1m9C5ZPC6Ix+DpmuFZoQJKq24u0rQJNep9EMZLiOt3gV7Ae1fRJVKTUNeFKkjrHXR0NW9GYkiQhSVmlqLRxv6z7Q4M/w6ps3yP/5YCquovFRU/OLatD9VZPoq64aeXcs7rQaSVJTtPHchJRhzstXXyJFfAhOkpPvwNxy6oNpdARxyZFyYtFFDW4OEMGG4GDZ6f6Mcce5Kjtdeyf3z21fSff+nvoaoph9/qJ1GSyZt8kzlo/NsOih9mz52Aucs8kSLx1UZ4PN8uHE0lhlxpeNeewJW9qblAaPM9T76DE+jE5W8fl3zim3eUpDcmT53m/z6UVzLDjRkJsjqmyOzVnfl6BJIVHZlf9E7PQdf4FVC+nbLqwD1EAAAAASUVORK5CYII%3D
// @description Открытый удмуртский битторрент-трекер.
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/opentorrent.js
// @connect *://izhtorrent.ru/*
// @require exKit
// @version 1.0.2
// ==/UserScript==

API_exKit({
    id: 'opentorrent',
    title: 'OpenTorrent',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3AkeBics+G6WHQAAAf9JREFUOMulk0tI1FEUh7878x8fmUVJCL3ICIKM3hRF0YuYVbQrilZBpJtCCo0e4KKFBRZC4iZBW5op4SwMCUZTKVBo0TsEdYrSqRB1nHHm/v+/FmpkOQj5Lc+59zv3XM4xksQC8M0VlIS8UVz3+/8JhmMhrj/L5/H78/MKzEwLkjDG8OjNcULvQsSTDtkZltvBZvIXn8AYk/4FkrAaoKRlJbUvQ6zIhUTKEk861PZcSnsZwAEwxlDWeoCkN0LruVEgQMfAfaqeXyXgg7sRqOuz/O0pXDYtmLDDVPd+JnrlKWVtRzi8LkimswTXEyc3lVFQZ1m9C5ZPC6Ix+DpmuFZoQJKq24u0rQJNep9EMZLiOt3gV7Ae1fRJVKTUNeFKkjrHXR0NW9GYkiQhSVmlqLRxv6z7Q4M/w6ps3yP/5YCquovFRU/OLatD9VZPoq64aeXcs7rQaSVJTtPHchJRhzstXXyJFfAhOkpPvwNxy6oNpdARxyZFyYtFFDW4OEMGG4GDZ6f6Mcce5Kjtdeyf3z21fSff+nvoaoph9/qJ1GSyZt8kzlo/NsOih9mz52Aucs8kSLx1UZ4PN8uHE0lhlxpeNeewJW9qblAaPM9T76DE+jE5W8fl3zim3eUpDcmT53m/z6UVzLDjRkJsjqmyOzVnfl6BJIVHZlf9E7PQdf4FVC+nbLqwD1EAAAAASUVORK5CYII%3D',
    desc: 'Открытый удмуртский битторрент-трекер.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1
    },
    categoryList: {
        serials: [96, 344, 688, 689, 705, 511, 690, 264, 265, 384, 687, 445, 439, 708, 709, 97, 467, 515, 259, 297, 430, 142, 262, 504, 531, 537, 435, 300, 433, 503, 147, 296, 526, 505, 529, 295, 514, 159, 153, 139, 431, 143, 162, 253, 525, 140, 436, 446, 512, 207, 137, 343, 532, 141, 434, 161, 534, 535, 145, 151, 144, 502, 148, 197, 542, 298, 533, 513, 440, 516, 209, 536, 530, 150],
        music: [554, 560, 561, 562, 563, 564, 555, 566, 567, 568, 569, 570, 571, 572, 573, 556, 576, 577, 578, 579, 580, 581, 582, 583, 557, 586, 587, 588, 590, 591, 592, 593, 594, 558, 596, 597, 598, 599, 600, 601, 559, 603, 604, 605, 606, 585, 613, 614, 615, 616, 617, 618, 619, 676, 620, 589, 629, 628, 627, 626, 625, 624, 623, 622, 675, 621, 608, 638, 637, 636, 635, 634, 633, 631, 677, 630, 609, 642, 641, 640, 678, 639, 610, 653, 652, 651, 650, 649, 648, 647, 646, 645, 644, 643, 73, 656, 405, 655, 354, 654, 70, 441, 442, 69, 510, 509, 659, 508, 657, 658, 355, 660, 662, 663, 36, 258, 257, 489, 664, 358, 665, 125, 418, 419, 667, 668, 359, 669, 170, 341, 360, 218, 670, 671, 672, 361, 398, 403, 402, 399, 375, 377, 376, 501, 673, 380, 35, 215, 213],
        games: [286, 11, 686, 123, 116, 88, 95, 93, 89, 92, 90, 220, 94, 91, 272, 276, 275, 274, 273, 277, 12, 522, 242, 707, 241, 413, 414, 406, 13, 221, 214, 236, 235, 234, 233, 231, 230, 229, 228, 227, 226, 225, 224, 223, 222],
        films: [16, 486, 211, 15, 417, 238, 550, 266, 420, 14, 342, 350, 421, 81, 210, 280, 155, 552, 680, 546, 429, 77, 517, 722, 723, 538],
        cartoon: [59, 483, 134, 156, 132, 133, 157, 271, 216, 468, 451, 58, 240, 239, 158, 679, 428, 518],
        books: [75, 389, 390, 412, 391, 348, 237, 217, 249, 497, 415, 64],
        soft: [184, 460, 46, 329, 322, 323, 324, 325, 427, 326, 327, 328, 443, 47, 45, 49, 51, 48, 80, 456, 487, 38, 488, 462, 466, 461, 186, 464, 463, 334, 470, 469, 447, 471, 163, 320, 321],
        anime: [9, 86, 85, 527, 83, 263, 681, 284, 283, 282, 84, 82, 269, 166, 281, 172, 173],
        doc: [98, 499, 79, 481, 495, 482, 268, 270, 54, 135, 548, 438, 164, 165, 494, 506, 682, 551, 541],
        sport: [169, 685, 374, 202, 544, 373, 543, 437, 201, 200, 345, 346, 267, 545],
        xxx: [484],
        humor: []
    },
    search: {
        loginUrl: 'https://izhtorrent.ru/login.php',
        searchUrl: 'https://izhtorrent.ru/tracker.php',
        baseUrl: 'https://izhtorrent.ru/',
        requestType: 'GET',
        requestData: 'nm=%search%',
        onAfterRequest: function (details) {
            if (/login\.php/.test(details.responseUrl)) {
                details.result = {requireAuth: 1};
            }
        },
        listItemSelector: 'table.forumline.tracker>tbody>tr',
        listItemSplice: [1, -1],
        torrentSelector: {
            categoryTitle: 'td:eq(1)>a',
            categoryUrl: {selector: 'td:eq(1)>a', attr: 'href'},
            categoryId: {selector: 'td:eq(1)>a', attr: 'href'},
            title: 'td.left>a',
            url: {selector: 'td.left>a', attr: 'href'},
            size: 'td.gensmall.nowrap.right',
            downloadUrl: {selector: 'td:eq(4)>a', attr: 'href'},
            seed: 'td.seedmed',
            peer: 'td.leechmed',
            date: 'td.gensmall:eq(-1)'
        },
        onGetValue: {
            categoryId: function (details, value) {
                return exKit.funcList.idInCategoryListInt(details.tracker, value, /f=([0-9]+)/);
            },
            size: function (details, value) {
                return exKit.funcList.sizeFormat(value)
            },
            date: function (details, value) {
                return exKit.funcList.dateFormat(1, value)
            }
        }
    }
});