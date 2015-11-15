/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib.hurtom = {
    id: 'hurtom',
    title: 'Hurtom',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AMHta2jB8WtonglTaJIVS2iSCU9ole1TaSIxywP3+/SX9/v0lQ5JywCSAV9oqglXaLIBU2il+VNoogFraKIBa2rjSxme508dnP4df0w5oNf9UlHC9tdLEZMDXzlz9/v4p/f7+Kb7Zzly01MRkV5Z0vRNoO/9Bh2LUtdTFabXUxWn9/v0S/f79KFOTcsIOZzn/cqaLof7+/CH+/v0R/v7+Ef7+/hH+/v0R/v78IXWpj6EPaT7/T5Fwwvz+/Cr9/v0T////AP3+/iRSk3LCDmg8/3Knjaf7/v0k////AP///wD///8A////APz+/SJ1qpGmDWg8/0yOb8T8/v4q////AP///wD9/v4jVZJywRNnOv90p42s+f7+K////wD///8A////AP///wD7/v0mdaeNqBJmOv9Qjm7F+/7+Lf///wD///8A/v39IlKUccEPajn/cqiLp/z+/SX9/v0F/f79B/3+/Qf9/f0F/v39HnOojaEQbDz/U5VzxPz9/Sn///8A////AP39/iVKlHLCAmo7/2yojaH+/v0o/f79Kfv+/DP8/v0y/f39Kf79/Shvp42hCGk9/0yScsH+/f4i////AP///wD+/vwiTpVowQ1wMv8Pajj/EGE+/xhlQv8YZUD/F2Q//wpnP/8CZj3/AHA5/wB0M/9Gl2nG+v78Mf///wD///8A/f79JU+TbsINbTn/ZaKCuNfn4Ffa5+FQ2+fhTdvn4U3Y6OFP1+jgUGCfgLQIaTj/TZJvwvz+/Sj///8A////APz9/ipJkXHEBWk+/26pkKX8/f0l/f79Dv3+/Qz9/v0M/f79Dv39/SNxqJGkCWtC/06VeML8/f4o////AP///wD9/f0mVJFxwhBmOf9zpYuh/v39HP///wD///8A////AP///wD+/f0cc6aNoQxnO/9QkXLC/f39Jf///wD///8A/f79I1eTb8IVaDj/eKiLo/3+/R7///8A////AP///wD///8A/v79HHKmiqENZjf/UJBuwv3+/SX///8A/v79Cv3+/SZPkm/CD2s6/3Sqjqb8/v0m/f3+DP79/gr9/f0K/f7+DP3+/SJwpo2kCmg8/1CUdMX7/v0v/f79D9vn4Ubb5+FIR4tmyQ5oN/9jn4C11ujiU97r5kb+/v0o/v39KN/r5kXY5+JPYp2BtAtnOP9Fi2jO1ujhVdbo4lIVZz3/FWc9/wZyL/8Adyv/AHEz/wNoP/8sfFzg/v77KP7++ygsfFzgB2Q//wtsNv8Ocy//CXAz/wBrQP8BbEH///8AAAGAAADH4wAAx+MAAMfjAADH4wAAx+MAAMfjAADAAwAAx+MAAMfjAADH4wAAx+MAAMfjAADH4wAAAYAAAA%3D%3D',
    desc: 'Об\'єднаймо все українське гуртом! Завантажити або скачати фільми і мультфільми українською, HD, українську музику, літературу, ігри та українізації',
    flags: {
        auth: 1,
        language: 'uk',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: [
        /*Serials*/[125, 124, 32, 44, 192, 195],
        /*Music  */[8, 23, 24, 43, 35, 37, 36, 38, 56, 98, 100, 101, 102, 103, 104, 105, 106],
        /*Games  */[10, 28, 29, 30, 41, 212, 205],
        /*Films  */[117, 42, 129, 219, 118, 16, 19, 55, 94, 144, 190, 70, 193, 194, 196, 197, 119, 18, 132],
        /*Cartoon*/[84],
        /*Books  */[11, 134, 177, 178, 179, 180, 183, 181, 182, 184, 185, 135, 186, 187, 189],
        /*Soft   */[9, 25, 199, 203, 204, 200, 201, 202, 26, 234, 27, 122, 211, 40, 12],
        /*Anime  */[127],
        /*Documen*/[225, 21, 131, 226, 227, 228, 229, 230, 136, 96, 173, 139, 174, 140, 120, 66, 137, 138, 33],
        /*Sport  */[157, 235, 170, 162, 166, 167, 168, 169, 54, 158, 159, 160, 161],
        /*XXX    */[],
        /*Humor  */[]
    ],
    search: {
        searchUrl: 'http://toloka.to/tracker.php',
        baseUrl: 'http://toloka.to/',
        requestType: 'GET',
        requestData: 'nm=%search%',
        onGetRequest: function(value) {
            "use strict";
            return encodeURIComponent(value);
        },
        listItemSelector: '#form>table.forumline:eq(1)>tbody>tr',
        listItemSplice: [1, -1],
        torrentSelector: {
            categoryTitle: 'td.gen>a',
            categoryUrl: {selector: 'td.gen>a', attr: 'href'},
            categoryId: {selector: 'td.gen>a', attr: 'href'},
            title: 'td.topictitle.genmed>a',
            url: {selector: 'td.topictitle.genmed>a', attr: 'href'},
            size: 'td.gensmall:eq(0)',
            downloadUrl: {selector: 'td.genmed:eq(3)>a', attr: 'href'},
            seed: 'td.seedmed',
            peer: 'td.leechmed',
            date: 'td.gensmall:eq(-1)'
        },
        onGetValue: {
            categoryId: function(value) {
                "use strict";
                return exKit.funcList.idInCategoryListInt.call(this, value, /f=([0-9]+)/);
            },
            size: function(value) {
                "use strict";
                return exKit.funcList.sizeFormat(value)
            },
            date: function(value) {
                "use strict";
                return exKit.funcList.dateFormat(0, value)
            }
        }
    }
};