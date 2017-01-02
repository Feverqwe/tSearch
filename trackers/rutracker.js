/**
 * Created by Anton on 02.01.2017.
 */
// ==UserScript==
// @name Рутрекер
// @version 1.0
// @icon data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg4ODLy8vd3d0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADPz8+KioqgoKDb29vj4+Pf39/q6uoAAAAAAAAAAAAAAAAAAAAAAAAAAADe3t7b29vS0tL29vZOTk5paWlycnJ8fHy8vLwAAAAAAADt7e3c3Nzg4ODc3NympqbDw8OIiIjj4+PtTUD8393///////////+8vLwAAAAAAADU1NSgoKCampqUlJSCgoLz8/NKSUni4uLpJxnqOCrwZ1z2oZvj4+PPz88AAAAAAADr6+vx8fGmpqaurq7P9dn///9paWm9WlPhIBLpIRLpIRL///9XV1fOzMwAAAAAAADg4OD///9D1miK5qEQyz////8+PT1GLCuTFQvNHhHhIBLrtrPPz8+kpKQAAAAAAADh4eH8/PwTzEEQyz8Qyz+M5qL///9sbGxWEQyZJBy9WlO7cmzU1NSioqIAAAAAAADDw8P///8Qyz8Qyz8Qyz8Qyz9r34j///+emZk+PT1lZWTS0tKmpqbg4OAAAAAAAADY2NiP56V74pVh3YAQyz////+mpqZYN9DDtfT///+zoPbf39+xsbEAAAAAAAAAAAAAAAAAAAAAAAAAAAA31F/t7e2YmJhMIedAEulRJ+uhivSYmJi8vLwAAAAAAAAAAAAAAAAAAAAAAADj4+P+/v7IyMh2XdBAEulAEulAEunHuflKSUmYmJgAAAAAAAAAAAAAAAAAAAAAAAAAAADg4ODt7e329vZaM+tAEulAEulRJ+v///9+fn7d3d0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADd3d2plPV4WO/////////////e3t7j4+MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADr6+v///////+/v7/i4uLu7u4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADV1dXp6ekAAAAAAAAAAAAAAAAAAAAAAAD+PwAA/gMAAPgDAAAAAwAAAAMAAAADAAAAAwAAAAMAAAADAAAABwAA8AcAAOAHAADwAwAA/AMAAPwPAAD/PwAA
// @description Крупнейший русскоязычный битторрент трекер. Скачать бесплатно фильмы, музыку, книги, программы..
// ==/UserScript==
var onPageLoad = function (response) {
    var body = response.body;
    var bodyDom = API_getDom(body);
    var $bodyDom = $(bodyDom);

    if (/login\.php/.test(response.url) || $bodyDom.find('#login-form').length) {
        return {success: false, error: 'requireAuth', loginUrl: 'https://rutracker.org/forum/login.php'};
    }

    var torrentElList = $bodyDom.find('#tor-tbl>tbody>tr');
    var results = [];
    for (var i = 0, len = torrentElList.length; i < len; i++) {
        try {
            var item = torrentElList.eq(i);
            var categoryTitle = item.find('td.row1.f-name>div>a').get(0);
            var categoryUrl = item.find('td.row1.f-name>div>a').get(0).attr('href');
            var title = item.find('td.row4.med.tLeft.t-title>div.wbr.t-title>a').get(0).text();
            var url = item.find('td.row4.med.tLeft.t-title>div.wbr.t-title>a').get(0).attr('href');
            var size = item.find('td.row4.small.nowrap.tor-size>u').get(0).text();
            var downloadUrl = item.find('td.row4.small.nowrap.tor-size>a').get(0).attr('href');
            var seed = item.find('td.row4.nowrap:eq(1)>u').get(0).text();
            var peer = item.find('td.row4.leechmed>b').get(0).text();
            var date = item.find('td.row4.small.nowrap:eq(1)>u').get(0).text();
            results.push({
                categoryTitle: categoryTitle,
                categoryUrl: categoryUrl,
                title: title,
                url: url,
                size: size,
                downloadUrl: downloadUrl,
                seed: seed,
                peer: peer,
                date: date
            });
        } catch (e) {
            console.error(e);
        }
    }
    var nextPageUrl = $bodyDom.find('div.nav>p:eq(1)>a.pg:eq(-1)').get(0).attr('href');
    return {
        success: true,
        results: results,
        nextPageRequest: nextPageUrl && {
            event: 'getNextPage',
            url: nextPageUrl
        }
    };
};

API_event('getNextPage', function (request) {
    return API_request({
        method: 'GET',
        url: request.url
    }).then(onPageLoad);
});

API_event('search', function(request) {
    return API_request({
        method: 'POST',
        url: 'https://rutracker.org/forum/tracker.php',
        data: {
            nm: request.query
        }
    }).then(onPageLoad);
});