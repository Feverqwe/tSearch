/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib.kaztorka = {
    id: 'kaztorka',
    title: 'Kaztorka',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuM4zml1AAAAJ+SURBVDhPjdBfTFJRHAfw8+Dmlg+25kMrbcncys0Hqq2NrbbWWlvrqZfe2kyNJkYoA122nJipSVvmLNNY8VBk/hcFrgh4BPwT/kFR4CIgcVWcV73ShYvoUweuS3tr++zsfL+/33k5oMLqK4OeQ2OJUwTx44SjR0RwGZSbl0sMTkQCcd0KOegnhUYX2/wlnw5IoBtdxNADJNBTPLyEfJgL7u0f7Mb22ch6OuI0EzvxgwONn0SxzOQGYiPO1zqQdjsR3YsTYYavWUDxsdYhMbjcW3Q0vt/hDKGIStGIC5TqXUXqeUQxF6RjcbRROGBH8cUovhpmKGav2bZSmFxAhMNOINQ583vnEKU9GI7GZtap/J7ZRqt3K8KQNFMLPeyUVaJZBDeVk9fbzHe+TCimAxQdNfk3Gy3ebZohqIhUt3RfZbv39edd5eQthZXXOnbtkxXw2iycOoxTj72G+Bq54w1tE5s7doLkvYeozK7DsuuxxELSlRYIrraMZVVrsmQaudGJB9ZYECfOv9Qm+n9x35rA5SZ4+rkaaTHjPmJjaCHgDm74VzcE3bNsf1ye3AC4b4wZ0v4MaV/7+PKvEFmjc4j77cEQuURs5si0ydGRi3V6kNdgSBf1IIoJ3zpJVWsXT4l7+xbQE+rjuDe9NDE6PEU9OTIM5Nbq0wRdaYLOz5N+kvpdqXaklXRlVgxMBcitXbrV6rvRNFr0zdZs8Z0QdGZXacEFGZbK70h91NE9v0rRjNzgTuX/QM5KBzrtxG4kFonG0Bc/UE6hnXOVQyCnSpdSoEp5qLr9DharZi7VYCkF3xNNsuQ8G+Q1GE4+6UZ31GRWqAG30XSmXP2fcl/p/wCFdNpHKe4MYgAAAABJRU5ErkJggg==',
    desc: 'Самый большой казахстанский трекер.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    search: {
        searchUrl: 'http://kaztorka.org/search',
        baseUrl: 'http://kaztorka.org/',
        loginUrl: 'http://kaztorka.org/auth/login',
        requestType: 'GET',
        requestData: 'torrentName=%search%',
        onGetRequest: function (details) {
            "use strict";
            details.query = encodeURIComponent(details.query);
        },
        listItemSelector: '#searchTable>tbody>tr',
        listItemSplice: [1, 0],
        loginFormSelector: '#loginForm',
        torrentSelector: {
            categoryTitle: 'td.lista.center.cCat>a',
            categoryUrl: {selector: 'td.lista.center.cCat>a', attr: 'href'},
            title: 'td.lista.cName>a',
            url: {selector: 'td.lista.cName>a', attr: 'href'},
            size: 'td.lista.center:eq(5)',
            downloadUrl: {selector: 'td.lista.center:eq(2)>a', attr: 'href'},
            seed: 'td.lista.center:eq(6)>font',
            peer: 'td.lista.center:eq(7)>font',
            date: 'td.lista.center:eq(3)'
        },
        onGetValue: {
            date: function (details, value) {
                "use strict";
                return exKit.funcList.dateFormat(0, value)
            },
            size: function (details, value) {
                "use strict";
                return exKit.funcList.sizeFormat(value)
            }
        }
    }
};