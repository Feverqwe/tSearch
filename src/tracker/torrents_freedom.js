/**
 * Created by Anton on 24.05.2015.
 */
engine.trackerLib['torrents.freedom'] = {
    id: 'torrents.freedom',
    title: 'Freedom',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAKJJREFUOE9j+E8iYCBR/X98Gr7vXft97RQgiWwoXg0tUe+jFL+3RFFRw/Pn36cUA40EmXpuK5DEa8P39++TDYEqEAjMxekkoNkQpSAbgH6t9oJzsfvhe7YTSEWy4f/v70EqYBbitAHTPAJ+IFkDxDyEk54/J+SHrXOgKrItQZ7OtiSgAeRPWMhAQxZ/sELCDpp+1k75f+3Y/3vXoCRSuJKcWgGsiJbhgQDwngAAAABJRU5ErkJggg%3D%3D',
    desc: 'Локальный торрент-трекер Freedom.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: {
        serials: [205, 575, 689, 469, 204, 449, 448, 465, 537, 206, 121, 209, 208, 207],
        music: [93, 252, 240, 133, 412, 411, 79, 253, 241, 134, 84, 254, 242, 95, 255, 243, 236, 232, 163, 159, 387, 139, 141, 140, 96, 256, 244, 94, 258, 245, 135, 136, 311, 138, 137, 107, 310, 91, 230, 97, 102, 265, 264, 147, 81, 268, 267, 145, 86, 270, 269, 104, 274, 273, 103, 272, 271, 238, 234, 165, 161, 150, 149, 148, 105, 276, 275, 154, 153, 152, 151, 109, 458, 231, 17, 259, 246, 127, 417, 416, 415, 414, 413, 80, 260, 247, 128, 83, 261, 248, 37, 262, 249, 237, 233, 164, 574, 160, 144, 142, 143, 38, 263, 250, 92, 257, 251, 75, 25, 24, 77, 108, 312, 456, 228, 457, 18, 278, 277, 129, 82, 280, 279, 130, 85, 282, 281, 41, 286, 285, 40, 284, 283, 239, 235, 166, 162, 157, 156, 155, 106, 288, 287, 26, 76, 23, 78, 110, 100, 229, 101],
        games: [664, 718, 717, 719, 665, 562, 87, 545, 546, 557, 558, 559, 560, 65, 477, 476, 475, 66, 71, 561, 64, 70, 481, 479, 478, 67, 578, 73, 370, 579, 580, 74, 367, 482, 181, 68, 483, 484, 365, 711, 715, 366, 563, 564, 565, 566, 567, 568, 569, 571, 572, 573, 653, 125, 660, 485, 659, 658, 657, 486, 656, 655, 487, 309],
        films: [9, 454, 468, 667, 430, 589, 590, 668, 433, 390, 305, 398, 434, 464, 7, 447, 437, 654, 587, 669, 455, 588, 670, 438, 442, 439, 301, 441, 10, 541, 540, 544, 576, 306, 8, 452, 302, 581],
        cartoon: [584, 173, 615, 666, 172, 613, 614, 171, 612, 170, 609, 608, 169, 606, 607, 168, 445, 444, 446, 610, 662, 536, 611, 179, 177, 178, 176, 549, 548, 547, 577, 651, 175, 174, 582],
        books: [601, 697, 353, 355, 602, 356, 357, 358, 52, 603, 690, 663, 534, 535, 354, 497, 351, 500, 501, 604, 499, 352, 498, 350, 324, 519, 492, 518, 493, 494, 495, 496, 515, 516, 342, 713, 513, 55, 341, 326, 343, 347, 686, 346, 345, 712, 344, 348, 349, 685, 359, 360, 363, 364, 361, 49, 695, 694, 317, 313, 314, 319, 318, 687, 688, 315, 202, 203, 505, 379, 383, 384, 381, 380, 378, 382, 385, 377, 376, 375, 386],
        soft: [47, 467, 462, 44, 459, 460, 461, 43, 523, 645, 524, 525, 526, 527, 646, 647, 644, 48, 46, 42, 528, 117, 466, 650, 131, 649, 648],
        anime: [124, 583, 451, 616, 167, 126, 158, 368, 369, 220, 683, 684],
        doc: [13, 187, 188, 298, 299, 300, 297, 296, 190, 191, 295, 291, 619, 201, 15, 185, 184, 629, 183, 542, 714, 186, 630, 122, 304, 14, 215, 214, 213, 212, 211, 210, 123],
        sport: [88, 196, 193, 192, 586, 194, 195, 198, 618, 585, 199, 197, 627, 628],
        xxx: [],
        humor: []
    },
    search: {
        loginUrl: 'http://torrents.freedom/forum/login.php',
        searchUrl: 'http://torrents.freedom/forum/tracker.php',
        baseUrl: 'http://torrents.freedom/forum/',
        requestType: 'POST',
        requestData: 'nm=%search%',
        requestMimeType: 'text/html; charset=windows-1251',
        onGetRequest: function (details) {
            "use strict";
            details.query = exKit.funcList.encodeCp1251(details.query);
        },
        onResponseUrl: function (details) {
            "use strict";
            if (/login\.php/.test(details.responseUrl)) {
                details.result = {requireAuth: 1};
            }
        },
        listItemSelector: 'table.forumline tr',
        torrentSelector: {
            categoryTitle: 'td:eq(3)>a',
            categoryUrl: {selector: 'td:eq(3)>a', attr: 'href'},
            categoryId: {selector: 'td:eq(3)>a', attr: 'href'},
            title: 'td:eq(4)>a',
            url: {selector: 'td:eq(4)>a', attr: 'href'},
            size: 'td:eq(7)',
            downloadUrl: {selector: 'td:eq(6)>a', attr: 'href'},
            seed: 'td:eq(8)',
            peer: 'td:eq(9)',
            date: 'td:eq(11)>p:eq(0)'
        },
        onGetValue: {
            categoryId: function (details, value) {
                "use strict";
                return exKit.funcList.idInCategoryListInt(details.tracker, value, /f=([0-9]+)/);
            },
            size: function (details, value) {
                "use strict";
                return exKit.funcList.sizeFormat(value);
            },
            date: function (details, value) {
                "use strict";
                var time = details.iter.$node.find('td:eq(11)>p:eq(1)').text();
                value += ' ' + time;
                value = exKit.funcList.monthReplace(value, 1);
                return exKit.funcList.dateFormat(1, value)
            }
        }
    }
};