torrent_lib['ru-board'] = function () {
    var name = 'ru-board';
    var filename = 'ru-board';
    var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTFH80I3AAACAElEQVQ4T2P4hw2cPnF05cIZK5bMh/KRAHYNy6dO2RRs2xriDuUjAewaJhcmbyuOWJgXfuHCBagQDGDX0J2XNyU6qjs2+vr161AhGEDXcOjggarSwiW+OocdVI/6as+d2AqVgAGEBqDSTdOqlrekzLJX+qAv9ZuJ+Q8v5wlv3Xwvi0ePHkEVQTQA+RE+Hg+XZ71dEv9qqvvUYN2bTExADUDUIcW/qSF0e1/SpuVzIdqgNqxZMvvn1oJ7kwIvpQk/atSd4KUM1ANUPSdIs9lJcdes1lVz+yf0dEE1HNmz+dYU37+rw//sqfx5Zs7jOUn3atQKbeV6QvQ210V+vLju7/MTfz/ePbpzDVTDpPKYRzP9QRq2F/45OeHvw/3/PtzbOanqzqKsvxtTIKasWTB5zYrFUA1AcHD3trZw40dLU0Ea7mxd1ldzr9t+YYn7+/mBS7ItpzXEz5gIcg8QgDS8efOmu6Mzkp+9VIZ9aqrLvNqUM4lc3xYFPNnYuKg2/NnOtn/3Vi+ZOwmh4fbt22FBwR5sLPNlWTYasmzyYH9TxP5jmvXfXSV/j3cD7fx3Y97yGe0IDRBw/vz53tSEfn2es4EsjzJBGkBe2lN5a1XVlnmdQEMhyhAaIACobUpuwu5A9p8T9K7PTlgxqQYoApUDA3QNEHDzwokVUzrRlILAv38AcPBDHc0bg+4AAAAASUVORK5CYII%3D';
    var login_url = 'http://dc.ru-board.com/login.php';
    var url = 'http://dc.ru-board.com/controls/tdata.php';
    var root_url = 'http://dc.ru-board.com/';
    var about = 'БитТоррент-трекере крупнейшего компьютерного форума в русскоязычном сегменте сети Интернет.';
    /*
     * a = требует авторизации
     * l = русскоязычный или нет
     * rs= поддержка русского языка
     */
    var flags = {
        a: 1,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var getCatName = function (id) {
        id = parseInt(id);
        if (id === 12) {
            return "БД и Карты";
        } else if (id === 8) {
            return "Аниме";
        } else if (id === 5) {
            return "Худ. Фильмы";
        } else if (id === 15) {
            return "Обучающие Курсы";
        } else if (id === 2) {
            return "Литература";
        } else if (id === 6) {
            return "Музыка";
        } else if (id === 1) {
            return "Софт";
        } else if (id === 4) {
            return "Игры";
        } else if (id === 7) {
            return "Мультфильмы";
        } else if (id === 14) {
            return "Док. Фильмы";
        } else if (id === 16) {
            return "Телепередачи";
        } else if (id === 10) {
            return "Сериалы";
        } else if (id === 11) {
            return "Клипы";
        } else if (id === 9) {
            return "XXX";
        }
        return undefined;
    };
    var getCat = function (id) {
        id = parseInt(id);
        if (id === 12 || id === 1) {
            return 6;
        } else if (id === 8) {
            return 7;
        } else if (id === 5) {
            return 3;
        } else if (id === 2) {
            return 5;
        } else if (id === 6) {
            return 1;
        } else if (id === 4) {
            return 2;
        } else if (id === 7) {
            return 4;
        } else if (id === 14 || id === 16) {
            return 8;
        } else if (id === 10) {
            return 0;
        } else if (id === 11) {
            return 1;
        } else if (id === 9) {
            return 10;
        }
        return -1;
    };
    var web = function () {
        var readCode = function (c) {
            if (c.length === 0) {
                view.auth(0, filename);
                return [];
            } else {
                view.auth(1, filename);
            }
            c = JSON.parse(c);
            if (c.torrents === undefined) {
                return;
            }
            var len = c.torrents.length;
            var arr = new Array(len);
            for (var i = 0; i < len; i++) {
                var item = c.torrents[i];
                var title = item.name;
                title = document.createTextNode(title).textContent;
                arr[i] = {
                    category: {
                        title: getCatName(item.catid),
                        id: getCat(item.catid)
                    },
                    title: title,
                    url: root_url + 'details.php?id=' + item.id,
                    size: item.size,
                    seeds: item.seeders,
                    leechs: item.leechers,
                    time: ex_kit.format_date(0, item.date)
                };
            }
            return arr;
        };
        var loadPage = function (text, cb) {
            if (xhr !== undefined) {
                xhr.abort();
            }
            xhr = engine.ajax({
                tracker: filename,
                type: 'POST',
                url: url,
                cache: false,
                data: {
                    take: 20,
                    skip: 0,
                    page: 1,
                    pageSize: 20,
                    filter: {
                        logic: 'and',
                        filters: [
                            {
                                field: 'name',
                                operator: 'contains',
                                value: text
                            }
                        ]
                    }
                },
                success: function (data) {
                    cb(1, readCode(data));
                },
                error: function () {
                    cb(2, 2);
                }
            });
        };
        return {
            getPage: loadPage
        };
    }();
    return {
        find: web.getPage,
        stop: function(){
            if (xhr !== undefined) {
                xhr.abort();
            }
            //view.loadingStatus(1, filename);
        },
        login_url: login_url,
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 1, 0, 0, 1, 0, 0, 0]
    };
}();