/**
 * Created by Anton on 24.05.2015.
 */
engine.trackerLib['x-torrents'] = {
    id: 'x-torrents',
    title: 'X-torrents',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHRztBQUFDQFBNSGNRQ2dNRltAQ0dASEFDSUhST19VR2teSnlSTlNRU01XYVBaaU42MEE4N0AuNTIpNCoqNTNESVhKS21IRXJOS3lKTmczPjw2RjVKT0ZKTklLUE9HSk4qNyEoNC49RFNZXXleWqFraJ9dXoBGSGBeXX1tbJZmZpxVVpNLT2hCRlFLT0pRVkddXoB3dKZuaa5eWKdbYX5BRFNDQUFLST87OTFERFJfXoZmZZ1xc6mDgqp3cYhZUl9EQ4NZUqdRR6RWT6pdU6YnNyxJTFBHQE1IQjcgLDJVVKpYVq9RWZVnX75TS5hHXkgiJSlfS7V5ZvNlYNlvaut4bsswNThHREApKzVyY9xwY+dwZ9Z2ZP1lWrtDSVBZVWAxLCMbHixPR6xwWP9cW/dYSOlzZc4hLDBfX8NcUfNjWexyV/9jXL07S0pXXFNcV1Q9PT0uOSkcIzJUTodJRt9QRfVDOOhSUeM+PetDRu5RT+VjX8hDRE5YZFJNVlNLUVw6PDY+QjctKTUoLCE9P41ANOo0NuIzKfEtMPBEOvhVR7FGTi9TT1tQVFVXXllCTkg5Py48O0UmLCsqMitMULk/M/84Nu07M+s1OO5AQOpgYMpIUmNIT0hUX09LU0xQVFk0NjcpNyUsOUF/c9NUUeJAR9JMPfI7PqBJQdxEO+9dVu1xa+JVXG9ATkNTXFJUVV8pLSg3O1R6bthuWvNlXOhnWfVXUKUnPQ1RUHxsWu1mWvJuYfKDdOBbX3xKUktWV1VETlhLVWdBSmVASmg7RFg2PjdERDZMRD1CPDczMjs+QlpGTmxJTpNZX4hlanNVXVMjJzlAP2ZdWJZuZrNva7ZiZI1NTmI3N0VOTWFta5V1cbhzbsNub5FZV21ST1hXUlM4QjEvOioqNykoNiosPElNVXJZW4RVVYVYWIhSWHs3RVgvP0xJSUlTUVFZVFZbVlg7Nzw1MzkrLTUyNT0/QkpFRV0/QVk8RFFES1xJTFpCRU1FSE1AQkJMUVBRWFVDTEkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    desc: 'Крупнейший торрент трекер X-Torrents.org. У нас можно бесплатно скачать игры, фильмы, музыку, ..., музыку. На нашем torrent трекере самые последние новинки фильмов (DVD/HDTV). Все фильмы на x-torrents.org имеют качественное изображение и звук!',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: {
        serials: ['tv'],
        music: ['music', 'video-clips'],
        games: ['games', 'games_psp', 'pda-games'],
        films: ['films', 'dvd', 'hdtv'],
        cartoon: ['mult'],
        books: ['knigi'],
        soft: ['soft'],
        anime: ['anime'],
        doc: ['doc-films'],
        sport: [],
        xxx: [],
        humor: []
    },
    search: {
        loginUrl: 'http://x-torrents.org/login',
        searchUrl: 'http://x-torrents.org/browse.php',
        baseUrl: 'http://x-torrents.org/',
        requestType: 'GET',
        requestData: 'search=%search%',
        requestMimeType: 'text/html; charset=windows-1251',
        onGetRequest: 'encodeCp1251',
        listItemSelector: '',
        torrentSelector: {
            categoryTitle: 'td:eq(1)>a',
            categoryUrl: {selector: 'td:eq(1)>a', attr: 'href'},
            categoryId: {selector: 'td:eq(1)>a', attr: 'href'},
            title: 'td.genmed>a',
            url: {selector: 'td.genmed>a', attr: 'href'},
            size: 'td.gensmall:eq(0)>u',
            downloadUrl: {selector: 'td:eq(4)>a', attr: 'href'},
            seed: 'td.seedmed',
            peer: 'td.leechmed',
            date: 'td.gensmall:eq(-1)>u'
        },
        onGetValue: {
            categoryId: function (value) {
                "use strict";
                return exKit.funcList.idInCategoryListInt(this, value, /f=([0-9]+)/);
            }
        }
    }
};