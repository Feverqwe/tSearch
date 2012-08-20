var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'Мегашара';
    var filename = 'megashara';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAABxt5IAjsSmACWZVgAkmlkAIp5cAKfXugD3+PYAJptcAPf5+QAlnF8AQ6hwABiLSAA0lVwAGolLAPz+/wAYjU4ADXI0AP/+/wAajU4AD3U0AAt5NwBMq3kAz+jaAA95NwAfkVEA7fXuAFCvfAAflVQAIZNXACGWVwAcm10AHptdAKTWuAAimloAIJxgAEKkbgDe7OYAF4RGAAhwLwBjsYIANpJdAAp0MgBHrHQAC3I1AOjw6QDO5NgANJpjAOrx7AAckVIAHJNPAA96OwAdlVUAD307ABN7PgDV7N4AIZlYACKdWwAlmlsAZKZ9ADONWAAXh0cACnMwAAxxMwD///sADHQzAAp1NgAOeDYAC3w5AA16PAA8mmQAIpBQAAx+PwBSrnsA7/XwAJ/VtwAjlVYA7/nzAB+dXACl1roA2+zfABWBPwBhqX4AqNS9ACWdXAAonFkAJ51cAPj7+QDG4dEACHAxAGauhAD9//wAGo5LAOf18QAdkFEADYA9AF2keQDW7OAAHpxaAPL59AAhml0AI5pdAI3HqgAinV0AJZpdACOdXQAlnV0AJ5xjAH26lgBFp3EACHIvAA1wMgALczIA/v/9AAt0NQANdzUAH5JPANPn2wBRq30AH5ZSAB2YWAASfT4AIJhYAD6haQAThEEAJJxbACacWwD3+vgAlsOoAPf++wAIcjAAGIpKAPr//gAJdDYA/f/+AP///gAMdjMA5/DtAJzKtADp8+0AD3c2AA94OQAQeDkADn88AB+XVgAhl1YAIJlcABF/RQAhnFwAIpxcABaBQgAknFwAFYVFAAxvMQAKcjEA/f78APv//wD//P8A/f//AMvl1wD///8ADHY0AOzz7gAeklEAhsOhAByXVwAflFcAVK18ANfs4wAjm1oAE4VGACadYAAonWAAB3EvABmHTAAIczUA//79AMvo2AAbjk8ADHk1AECRYABUsH0AHZ5bABWAQQAShEQAIZxeACObWwAWh0QA3fDnAAlxMAAHdDAAl8mrAAtxMAAKcjMA/P7+AAh2NgD+/v4AC3M2AAt1MwD//v4AG41NAJ7IsQAKdzkAS697AB2UUABRrHsAEno5ABR6OQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgW6BmaxuWL0+vG1YmL89JhCuKykrwBMrxUDEK4TCb3GyQsmHO38tdMizcouyQRegjI1DXyyGhoaDSToURDLNzniOKIqdDhHDwZ1iUTRHNV57tgGGmla+a0+frwZZUJKVlzxXg5+JuiUMFsOcfie3qa2CsJ+fo4ILDUVghVoIAEYPW1KGnS91x7ESeiSGhp4uMDGmgHCGocyic11sGacjGMsbS2WdP4VcSHYcGxUKM6V5HY9nIJ8RxogaNx0CHaSQkR85dwlODoabTLR8N2MDIVVTHqpoq0qdcLvKqGaTYzhNVGk5OCJqBTYqZJN9B2mUaAdhB7kEuAeWtZRok3x9kwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%3D';
    var url = 'http://megashara.com/search/';
    var root_url = 'http://megashara.com';
    var about = 'У нас Вы сможете скачать все, что Вам нужно: музыка, фильмы, видео, игры абсолютно бесплатно!';
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
        var calculateCategory = function (n) {
            if (n == 'Фильмы')
                return 3;
            if (n == 'ТВ')
                return 3;
            else if (n == 'Игры' || n == 'Онлайн игры.')
                return 2;
            else if (n == 'Музыка')
                return 1;
            else if (n == 'Сериалы')
                return 0;
            return -1;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);//.contents();
            t = t.find('table.table-wide').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(0).text(), 
                        'id': calculateCategory(td.eq(0).text())
                    },
                    'title' : td.eq(1).children('a').text(),
                    'url' : td.eq(1).children('a').attr('href'),
                    'size' : calculateSize(td.eq(3).children().text()),
                    'dl' : td.eq(2).children('a').attr('href'),
                    'seeds' : td.eq(4).text(),
                    'leechs' : td.eq(5).text(),
                    'time' : 0
                }
            }
            return arr;
        }
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'GET',
                url: url,
                cache : false,
                data: {
                    'sorting' : 'seed',
                    'time' : 'ALL',
                    'year' : 0,
                    'parent' : 0,
                    'where' : 'title',
                    'all_words' : 1,
                    'text' : text,
                    'order' : 'added'
                },
                success: function(data) {
                    view.result(id,readCode(data),t);
                },
                error:function (xhr, ajaxOptions, thrownError){
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
        id : id,
        name : name,
        icon : icon,
        about : about,
        url : root_url,
        filename : filename
    }
}();
engine.ModuleLoaded(tmp_num);