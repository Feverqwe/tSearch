/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib.inmac = {
    id: 'inmac',
    title: 'InMac',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABMLAAATCwAAAAAAAAAAAAD///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BvIYqT8WNJ2vFjShrxY0oa8WMKGvAiSlldEYuA////wH///8B////Af///wH///8B////Af///wH///8BpnAoI72AKcW4fynFvYQqf7qCKoG5gSqdxIUq2f///wH///8B////Af///wH///8B////Af///wH///8BsXUlgahuJJ+lcCdDtnUi27BzI4GqbyJttnUi26VuJVWfgCAD////Af///wH///8B////Af///wG4cSoDpnIpK7l6JbH///8Bn18gA6NyKxmtcSOVtHYj16hzKGmucyNtoXQqEf///wH///8B////Af///wH///8Bv4AgA6x0KEXBgCit////Aa12J1+9fiijunsm27l6JN/AfyeptXYlpbl7J5mqgCoD////Af///wH///8B////AbiORwOmdCspv4Ao7aZ2LDXCgSjpsHcoV6VzLCFKVT8DxXM5A6JxLR+7fSjlfWY1Bf///wH///8B////Af///wH///8BgmM2CcWFLfGqdi1RxYUt64toLgeqgCoD////Af///wH///8Bxocuy655LjvUjkcD////Af///wH///8B////AdSAKgPNjS7RsHotWcOGK/mmdi0fqoAqA////wGqgCoDwIIiA72DLIG+hC2PqoArA////wH///8B////Af///wGKZy4LzpAr5beBK0vQkSzftX4rQ55gIgPUgCoDlmsuFbmCK1PDiCq3z5Aq+7R/LFX///8Bo3UuF7yGKl2+hyllzJApx8qPKduhdCwN0pUrvcCIKZXBiSmB1JYqx82RKfXTlSvLvoYphcCGKWW2gCtP////AYBmMwO7hSln05cqpcKKKIGpeCsV3Z4+A9GWKMnVmSf3z5Qpr7uFKWGldSwd////Af///wH///8B////Af///wH///8B////AbiORwP///8B////Af///wHPlirNuIQqO8CCPgP///8BqoAqA////wH///8B////Af///wH///8B////Af///wH///8B////Af///wGqgCsDoXQtEf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%3D%3D',
    desc: 'Русскоязычный MAC - трекер, макинтош, хакинтош, программы, игры, видео, музыка, форум, вопросы, решения, общение..',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: [
        /*Serials*/[],
        /*Music  */[331, 332, 333, 334, 335, 336, 337, 273],
        /*Games  */[376, 17, 426, 414, 264, 369, 370, 371, 372, 373, 374, 348, 381],
        /*Films  */[378, 457, 453, 454, 455],
        /*Cartoon*/[],
        /*Books  */[7, 105, 389],
        /*Soft   */[452, 13, 438, 254, 14, 439, 256, 42, 351, 350, 255, 15, 211, 39, 46, 208, 70, 16, 380, 382, 383, 384, 385, 386, 388, 393, 368, 367, 199, 366, 11, 30],
        /*Anime  */[],
        /*Documen*/[],
        /*Sport  */[],
        /*XXX    */[],
        /*Humor  */[]
    ],
    search: {
        searchUrl: 'https://inmac.org/tracker.php',
        baseUrl: 'https://inmac.org/',
        loginUrl: 'https://inmac.org/login.php',
        requestType: 'GET',
        requestData: 'nm=%search%',
        onGetRequest: function(value) {
            "use strict";
            return encodeURIComponent(value);
        },
        onResponseUrl: function(value) {
            "use strict";
            return !exKit.funcList.strContain(value, '/auth/');
        },
        listItemSelector: '#tor-tbl>tbody>tr',
        torrentSelector: {
            categoryTitle: 'td:eq(2)>a',
            categoryUrl: {selector: 'td:eq(2)>a', attr: 'href'},
            categoryId: {selector: 'td:eq(2)>a', attr: 'href'},
            title: 'td.row4.med.tLeft.u>div>a',
            url: {selector: 'td.row4.med.tLeft.u>div>a', attr: 'href'},
            size: 'td.row4.small.nowrap.tor-size>u',
            downloadUrl: {selector: 'td.row4.small.nowrap.tor-size>a', attr: 'href'},
            seed: 'td.row4.seedmed',
            peer: 'td.row4.leechmed',
            date: 'td.row4.small.nowrap:eq(1)>u'
        },
        onGetValue: {
            categoryId: function(value) {
                "use strict";
                return exKit.funcList.idInCategoryListInt.call(this, value, /f=([0-9]+)/);
            }
        }
    }
};