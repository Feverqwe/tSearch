/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib.libertorrent = {
    id: 'libertorrent',
    title: 'Книжный трекер',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAT/BAXmlZD///HDEg//BwP/AgnyBQj/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX3BwL2CQ3+8fPv+/2mTkfzAAD/Agj5BAj/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/AgKSEgf9///++v/43dPrBAD7BAbwBgj/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAXyAAH7lo7/7+v/2Nf//vHBKiP/BQLtCAT/BAX/BAX/BAX/BAX7BQX/BAX/BQb8BgbBFAz//+f038nvuqX/8Ob//+vJBwD9AAD/BAX/BAX/BAX/BAX/BAX/BAX4BwbyCgilYFbCNjWzCQfzBwf0DAj6BAT7AAD/AQT/BAX/BAX/BAX/BAX7BQX/BAT6AgLRFxHq//PBAgn//fHj+e28gIaSCA/QEBD9AAD/BAX/BAX/BAX/BAXyBwT7BgTJISDQj4f/8ur/5ej/5OLVAAmqBgCWIR7/v8Xp9/P5BQX9BQX/BAX/BAX/BAT/BAXmr6jx8/SlIyTc8eL/9PLx//7u9v//+fHSXUjfFAf0Cwn6Bgb/BAX/BAX5BwH/BAWtY1/z+Pfy9ur+pJm7CwqfMyjp2dLy/v75/v/0//XQKR73DAn/BQLtCAT/BQT/BQL6AAbRloP5/P//9//1+vn///G6XU7/CQ+/CwzRyL7l6M//Aw7/BAX7BgT/BAXyBwX9AgH/BwfWBgDjzcH/+Pvn////9P/y/v7/fYL/AAr/tKT6AAT/BAT0BwT/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/REL0++zu9PnBh4H/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX9Dgv/Bxfu8u3Stqv/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BATyBwTskYjyAQr/BAX/BAX/BAX/BAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    desc: 'Книжный трекер (booktracker.org), рукописи не горя.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1
    },
    search: {
        searchUrl: 'http://booktracker.org/tracker.php',
        nextPageSelector: {selector: '#main_content .bottom_info .nav a:eq(-1)', attr: 'href'},
        baseUrl: 'http://booktracker.org/',
        loginUrl: 'http://booktracker.org/login.php',
        requestType: 'GET',
        requestData: 'nm=%search%&to=1&max=1',
        onAfterRequest: function (details) {
            "use strict";
            if (/login\.php/.test(details.responseUrl)) {
                details.result = {requireAuth: 1};
            }
        },
        listItemSelector: '#tor-tbl>tbody>tr',
        torrentSelector: {
            categoryTitle: 'td:eq(2)>a',
            categoryUrl: {selector: 'td:eq(2)>a', attr: 'href'},
            title: 'td.row4.med.tLeft>a',
            url: {selector: 'td.row4.med.tLeft>a', attr: 'href'},
            size: 'td.row4.small.nowrap:eq(0)>u',
            downloadUrl: {selector: 'td.row4.small.nowrap:eq(0)>a', attr: 'href'},
            seed: 'td.row4.seedmed',
            peer: 'td.row4.leechmed',
            date: 'td.row4.small.nowrap:eq(1)>u'
        }
    }
};