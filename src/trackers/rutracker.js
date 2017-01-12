// ==UserScript==
// @name Рутрекер
// @trackerURL http://rutracker.org
// @icon data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg4ODLy8vd3d0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADPz8+KioqgoKDb29vj4+Pf39/q6uoAAAAAAAAAAAAAAAAAAAAAAAAAAADe3t7b29vS0tL29vZOTk5paWlycnJ8fHy8vLwAAAAAAADt7e3c3Nzg4ODc3NympqbDw8OIiIjj4+PtTUD8393///////////+8vLwAAAAAAADU1NSgoKCampqUlJSCgoLz8/NKSUni4uLpJxnqOCrwZ1z2oZvj4+PPz88AAAAAAADr6+vx8fGmpqaurq7P9dn///9paWm9WlPhIBLpIRLpIRL///9XV1fOzMwAAAAAAADg4OD///9D1miK5qEQyz////8+PT1GLCuTFQvNHhHhIBLrtrPPz8+kpKQAAAAAAADh4eH8/PwTzEEQyz8Qyz+M5qL///9sbGxWEQyZJBy9WlO7cmzU1NSioqIAAAAAAADDw8P///8Qyz8Qyz8Qyz8Qyz9r34j///+emZk+PT1lZWTS0tKmpqbg4OAAAAAAAADY2NiP56V74pVh3YAQyz////+mpqZYN9DDtfT///+zoPbf39+xsbEAAAAAAAAAAAAAAAAAAAAAAAAAAAA31F/t7e2YmJhMIedAEulRJ+uhivSYmJi8vLwAAAAAAAAAAAAAAAAAAAAAAADj4+P+/v7IyMh2XdBAEulAEulAEunHuflKSUmYmJgAAAAAAAAAAAAAAAAAAAAAAAAAAADg4ODt7e329vZaM+tAEulAEulRJ+v///9+fn7d3d0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADd3d2plPV4WO/////////////e3t7j4+MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADr6+v///////+/v7/i4uLu7u4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADV1dXp6ekAAAAAAAAAAAAAAAAAAAAAAAD+PwAA/gMAAPgDAAAAAwAAAAMAAAADAAAAAwAAAAMAAAADAAAABwAA8AcAAOAHAADwAwAA/AMAAPwPAAD/PwAA
// @description Крупнейший русскоязычный битторрент трекер. Скачать бесплатно фильмы, музыку, книги, программы..
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/rutracker.js
// @connect *://rutracker.org/*
// @require jquery
// @version 1.0.1
// ==/UserScript==

var deSanitizeKeys = ['categoryTitle', 'categoryUrl', 'title', 'url', 'downloadUrl'];
var urlKeys = ['categoryUrl', 'url', 'downloadUrl', 'nextPageUrl'];

var onPageLoad = function (response) {
    var body = response.body;
    body = API_sanitizeHtml(body);
    var bodyDom = API_getDom(body);
    var $bodyDom = $(bodyDom);

    if (/login\.php/.test(response.url) || $bodyDom.find('#login-form').length) {
        return {success: false, error: 'AUTH', message: 'requireAuth', url: 'https://rutracker.org/forum/login.php'};
    }

    var torrentElList = $bodyDom.find('#tor-tbl>tbody>tr');
    var results = [];

    for (var i = 0, len = torrentElList.length; i < len; i++) {
        try {
            var $node = torrentElList.eq(i);
            var categoryTitle = $node.find('td.row1.f-name>div>a').text();
            var categoryUrl = $node.find('td.row1.f-name>div>a').attr('href');
            var title = $node.find('td.row4.med.tLeft.t-title>div.wbr.t-title>a').text();
            var url = $node.find('td.row4.med.tLeft.t-title>div.wbr.t-title>a').attr('href');
            var size = $node.find('td.row4.small.nowrap.tor-size>u').text();
            var downloadUrl = $node.find('td.row4.small.nowrap.tor-size>a').attr('href');
            var seed = $node.find('td.row4.nowrap:eq(1)>u').text();
            var peer = $node.find('td.row4.leechmed>b').text();
            var date = $node.find('td.row4.small.nowrap:eq(1)>u').text();

            var item = {
                categoryTitle: categoryTitle,
                categoryUrl: categoryUrl,
                title: title,
                url: url,
                size: size,
                downloadUrl: downloadUrl,
                seed: seed,
                peer: peer,
                date: date
            };

            deSanitizeKeys.forEach(function (key) {
                if (item[key]) {
                    item[key] = API_deSanitizeHtml(item[key]);
                }
            });

            urlKeys.forEach(function (key) {
                if (item[key]) {
                    item[key] = API_normalizeUrl(response.url, item[key]);
                }
            });

            results.push(item);
        } catch (e) {
            console.error(e);
        }
    }
    var nextPageUrl = $bodyDom.find('div.nav>p:eq(1)>a.pg:eq(-1)').attr('href');
    if (nextPageUrl) {
        nextPageUrl = API_normalizeUrl(response.url, nextPageUrl);
    }
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