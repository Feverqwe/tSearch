/**
 * Created by Anton on 24.05.2015.
 */
engine.trackerLib.riperam = {
    id: 'riperam',
    title: 'riper.am',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAD///////////////////////////////////////////////////////8AAAAAAAD///8BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp3///8AAAAAAAD///8EBaAFBqBub8v////r7PUEBaAEBaBub8v////x8fYEBZ8FBZ////8AAAAAAAD///8ICaMJCaQICqQJCaP///8ICaRub8v////r7PUJCaQICaQICaT///8AAAAAAAD///8OD6gODqgND6gODqj///8ND6jx8fZub8sND6gND6gOD6gODqj///8AAAAAAAD///8TFa0TFK4TFa0UFK3////////x8fb///////8UFK0TFK0TFK3///8AAAAAAAD///8ZGrIZG7IZG7IZG7P///8ZGrMaGrMaGrLr7PX///8aG7MaG7P///8AAAAAAAD///8gIbgfIbgfILggILj///8gIbgfILcgIbgfILj///8gILgfIbj///8AAAAAAAD///8lJr0lJr0lJr1ub8v///8lJr0lJr0lJr3r7PX///8lJr0lJ73///8AAAAAAAD///8rK8IqK8H////////////////x8fb///////8rK8ErLMIqLML///8AAAAAAAD///8uMMUvMMUvMMVub8svMMYvL8UvMMUvMMUvMMUvMMUvMMYuMMX///8AAAAAAAD///8yM8gyM8gyM8gyM8gyM8gNx9ENx9ENx9EyM8gyM8gyM8gyM8j///8AAAAAAAD///8yM8gyM8gyM8gyM8gNx9EyM8gNx9EyM8gNx9EyM8gyM8gyM8j///8AAAAAAAD///////////////////////////////////////////////////////8AAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPCEtLQokKCdib2R5JykuZXEoMCkuY3NzKCd3aWR0aCcpCi0tPgo%3D',
    desc: 'Riper.AM - Торрент трекер. Смотреть онлайн. Фильмы, сериалы, музыка, игры , софт, книги все новинки только для вас.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    search: {
        loginUrl: 'http://riper.am/ucp.php?mode=login',
        searchUrl: 'http://riper.am/search.php',
        baseUrl: 'http://riper.am/',
        requestType: 'GET',
        onResponseUrl: {not: 1, exec: 'strContain', args: [{arg: 0}, 'ucp.php?mode=login']},
        requestData: 'keywords=%search%&sr=topics&sf=titleonly&fp=1&tracker_search=torrent',
        onGetRequest: 'encodeURIComponent',
        listItemSelector: 'ul.topiclist.topics>li',
        torrentSelector: {
            categoryTitle: 'dl>dt>a:eq(3)',
            categoryUrl: {selector: 'dl>dt>a:eq(3)', attr: 'href'},
            title: 'dl>dt>a.topictitle',
            url: {selector: 'dl>dt>a.topictitle', attr: 'href'},
            size: 'dl>dt>b:eq(1)',
            downloadUrl: {selector: 'dl>dt>a:eq(0)', attr: 'href'},
            seed: 'dl>dd.posts>span.my_tt.seed',
            peer: 'dl>dd.posts>span.my_tt.leech',
            date: {selector: 'dl>dt'}
        },
        onGetValue: {
            size: {exec: 'sizeFormat', args: [{arg: 0}]},
            date: function(value) {
                "use strict";
                var m = value.match(/»([^,]+, \d+:\d+)/);
                if (!m) {
                    return;
                }
                value = m[1];
                value = exKit.funcList.monthReplace(value, 1);
                return exKit.funcList.dateFormat(1, value)
            }
        }
    }
};