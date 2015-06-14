/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib.megashara = {
    id: 'megashara',
    title: 'Мегашара',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAABxt5IAjsSmACWZVgAkmlkAIp5cAKfXugD3+PYAJptcAPf5+QAlnF8AQ6hwABiLSAA0lVwAGolLAPz+/wAYjU4ADXI0AP/+/wAajU4AD3U0AAt5NwBMq3kAz+jaAA95NwAfkVEA7fXuAFCvfAAflVQAIZNXACGWVwAcm10AHptdAKTWuAAimloAIJxgAEKkbgDe7OYAF4RGAAhwLwBjsYIANpJdAAp0MgBHrHQAC3I1AOjw6QDO5NgANJpjAOrx7AAckVIAHJNPAA96OwAdlVUAD307ABN7PgDV7N4AIZlYACKdWwAlmlsAZKZ9ADONWAAXh0cACnMwAAxxMwD///sADHQzAAp1NgAOeDYAC3w5AA16PAA8mmQAIpBQAAx+PwBSrnsA7/XwAJ/VtwAjlVYA7/nzAB+dXACl1roA2+zfABWBPwBhqX4AqNS9ACWdXAAonFkAJ51cAPj7+QDG4dEACHAxAGauhAD9//wAGo5LAOf18QAdkFEADYA9AF2keQDW7OAAHpxaAPL59AAhml0AI5pdAI3HqgAinV0AJZpdACOdXQAlnV0AJ5xjAH26lgBFp3EACHIvAA1wMgALczIA/v/9AAt0NQANdzUAH5JPANPn2wBRq30AH5ZSAB2YWAASfT4AIJhYAD6haQAThEEAJJxbACacWwD3+vgAlsOoAPf++wAIcjAAGIpKAPr//gAJdDYA/f/+AP///gAMdjMA5/DtAJzKtADp8+0AD3c2AA94OQAQeDkADn88AB+XVgAhl1YAIJlcABF/RQAhnFwAIpxcABaBQgAknFwAFYVFAAxvMQAKcjEA/f78APv//wD//P8A/f//AMvl1wD///8ADHY0AOzz7gAeklEAhsOhAByXVwAflFcAVK18ANfs4wAjm1oAE4VGACadYAAonWAAB3EvABmHTAAIczUA//79AMvo2AAbjk8ADHk1AECRYABUsH0AHZ5bABWAQQAShEQAIZxeACObWwAWh0QA3fDnAAlxMAAHdDAAl8mrAAtxMAAKcjMA/P7+AAh2NgD+/v4AC3M2AAt1MwD//v4AG41NAJ7IsQAKdzkAS697AB2UUABRrHsAEno5ABR6OQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgW6BmaxuWL0+vG1YmL89JhCuKykrwBMrxUDEK4TCb3GyQsmHO38tdMizcouyQRegjI1DXyyGhoaDSToURDLNzniOKIqdDhHDwZ1iUTRHNV57tgGGmla+a0+frwZZUJKVlzxXg5+JuiUMFsOcfie3qa2CsJ+fo4ILDUVghVoIAEYPW1KGnS91x7ESeiSGhp4uMDGmgHCGocyic11sGacjGMsbS2WdP4VcSHYcGxUKM6V5HY9nIJ8RxogaNx0CHaSQkR85dwlODoabTLR8N2MDIVVTHqpoq0qdcLvKqGaTYzhNVGk5OCJqBTYqZJN9B2mUaAdhB7kEuAeWtZRok3x9kwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%3D',
    desc: 'У нас Вы сможете скачать все, что Вам нужно: музыка, фильмы, видео, игры абсолютно бесплатно!',
    flags: {
        auth: 0,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: [
        /*Serials*/['Сериалы'],
        /*Music  */['Музыка'],
        /*Games  */['Игры', 'Онлайн игры.'],
        /*Films  */['Фильмы', 'ТВ'],
        /*Cartoon*/[],
        /*Books  */[],
        /*Soft   */[],
        /*Anime  */[],
        /*Documen*/[],
        /*Sport  */[],
        /*XXX    */[],
        /*Humor  */[]
    ],
    search: {
        searchUrl: 'http://megashara.com/search/',
        baseUrl: 'http://megashara.com/',
        requestType: 'GET',
            requestData: 'text=%search%&sorting=seed&time=ALL&year=0&parent=0&where=title&all_words=1&order=added',
        onGetRequest: 'encodeURIComponent',
        listItemSelector: 'table.table-wide>tbody>tr',
        torrentSelector: {
            categoryTitle: 'td:eq(0)',
            categoryId: 'td:eq(0)',
            title: 'td.flat-result.left>a',
            url: {selector: 'td.flat-result.left>a', attr: 'href'},
            size: 'td:eq(3)',
            downloadUrl: {selector: 'td:eq(2) a', attr: 'href'},
            seed: 'td.flat-result.color-green',
            peer: 'td.flat-result.color-red'
        },
        onGetValue: {
            categoryId: {exec: 'idInCategoryList', args: [{arg: 0}]},
            size: function(value) {
                "use strict";
                return exKit.funcList.sizeFormat(value);
            }
        }
    }
};
