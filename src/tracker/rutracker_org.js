/**
 * Created by Anton on 09.03.2015.
 */
engine.trackerLib['rutracker'] = {
    id: 'rutracker',
    title: 'Рутрекер',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg4ODLy8vd3d0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADPz8+KioqgoKDb29vj4+Pf39/q6uoAAAAAAAAAAAAAAAAAAAAAAAAAAADe3t7b29vS0tL29vZOTk5paWlycnJ8fHy8vLwAAAAAAADt7e3c3Nzg4ODc3NympqbDw8OIiIjj4+PtTUD8393///////////+8vLwAAAAAAADU1NSgoKCampqUlJSCgoLz8/NKSUni4uLpJxnqOCrwZ1z2oZvj4+PPz88AAAAAAADr6+vx8fGmpqaurq7P9dn///9paWm9WlPhIBLpIRLpIRL///9XV1fOzMwAAAAAAADg4OD///9D1miK5qEQyz////8+PT1GLCuTFQvNHhHhIBLrtrPPz8+kpKQAAAAAAADh4eH8/PwTzEEQyz8Qyz+M5qL///9sbGxWEQyZJBy9WlO7cmzU1NSioqIAAAAAAADDw8P///8Qyz8Qyz8Qyz8Qyz9r34j///+emZk+PT1lZWTS0tKmpqbg4OAAAAAAAADY2NiP56V74pVh3YAQyz////+mpqZYN9DDtfT///+zoPbf39+xsbEAAAAAAAAAAAAAAAAAAAAAAAAAAAA31F/t7e2YmJhMIedAEulRJ+uhivSYmJi8vLwAAAAAAAAAAAAAAAAAAAAAAADj4+P+/v7IyMh2XdBAEulAEulAEunHuflKSUmYmJgAAAAAAAAAAAAAAAAAAAAAAAAAAADg4ODt7e329vZaM+tAEulAEulRJ+v///9+fn7d3d0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADd3d2plPV4WO/////////////e3t7j4+MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADr6+v///////+/v7/i4uLu7u4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADV1dXp6ekAAAAAAAAAAAAAAAAAAAAAAAD+PwAA/gMAAPgDAAAAAwAAAAMAAAADAAAAAwAAAAMAAAADAAAABwAA8AcAAOAHAADwAwAA/AMAAPwPAAD/PwAA',
    desc: 'Крупнейший русскоязычный битторрент трекер. Скачать бесплатно фильмы, музыку, книги, программы..',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    search: {
        loginUrl: 'http://login.rutracker.org/forum/login.php',
        loginFormSelector: '#login-form',
        searchUrl: 'http://rutracker.org/forum/tracker.php',
        baseUrl: 'http://rutracker.org/forum/',
        requestType: 'POST',
        requestDataType: 'text',
        requestData: 'nm=%search%',
        listItemSelector: '#tor-tbl>tbody>tr',
        torrentSelector: {
            categoryTitle: 'td.row1.f-name>div>a',
            categoryUrl: {selector: 'td.row1.f-name>div>a', attr: 'href'},
            categoryId: {selector: 'td.row1.f-name>div>a', attr: 'href'},
            title: 'td.row4.med.tLeft.t-title>div.wbr.t-title>a',
            url: {selector: 'td.row4.med.tLeft.t-title>div.wbr.t-title>a', attr: 'href'},
            size: 'td.row4.small.nowrap.tor-size>u',
            downloadUrl: {selector: 'td.row4.small.nowrap.tor-size>a', attr: 'href'},
            seed: 'td.row4.nowrap:eq(1)>u',
            peer: 'td.row4.leechmed>b',
            date: 'td.row4.small.nowrap:eq(1)>u'
        },
        onGetValue: {
            categoryId: function(value) {
                "use strict";
                var cId = value.match(/f=([0-9]+)/);
                if (cId === null) {
                    return -1;
                }
                cId = parseInt(cId[1]);
                if (isNaN(cId)) {
                    return -1;
                }
                return cId;
            }
        }
    }
};