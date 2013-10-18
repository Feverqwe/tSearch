var explore = function() {
    var _google_proxy = parseInt(GetSettings('google_proxy') || 0);
    var xhr = {};
    var read_content = function(type, content) {
        var About = function(c) {
            c = view.contentFilter(c);
            var mt = view.load_in_sandbox(null, c);

            var t = mt.find('#rhs_block').find('div.kno-ec.rhsvw.vk_rhsc').eq(0).children('div');

            if (t.length === 0) {
                return;
            }

            t.find('span.kno-fm.fl.q').remove();

            var obj = t.find('a');
            if (obj.length === 0)
                return;
            for (var i = 0; i < obj.length; i++) {
                if (obj.eq(i).attr('href') === undefined)
                    continue;
                if (obj.eq(i).attr('href')[0] === '/')
                    obj.eq(i).attr('href', 'http://google.com' + obj.eq(i).attr('href'));
                obj.eq(i).attr('target', '_blank');
            }
            var imgs = t.find('img');
            for (var i = 0; i < imgs.length; i++) {
                var par_href = decodeURIComponent(imgs.eq(i).parent('a').attr('href'));
                if (par_href === "undefined")
                    continue;
                if (par_href.indexOf("imgres") < 0) {
                    imgs.eq(i).parent('a').remove();
                    continue;
                }
                imgs.eq(i).attr('src', par_href.replace(/.*=http(.*)&imgref.*/, 'http$1'));
                if (imgs.eq(i).attr('src')[0] === '/') {
                    imgs.eq(i).attr('src', '#' + imgs.eq(i).attr('src'));
                }
            }
            var info = {};
            var google_proxy = (!_google_proxy) ? "" : "https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=400&rewriteMime=image/jpeg&url=";
            info['img'] = t.find('a.bia.uh_rl').eq(0).children('img').attr('src');
            info['title'] = t.find('div.kno-ecr-pt').html();
            info['type'] = t.find('div.kno-ecr-st').html();
            info['desc'] = t.find("div.kno-desc").html();
            info['table'] = t.find('table.kno-fs').html();
            var content_info = '';
            if (info.title === undefined || info.desc === undefined) {
                return '';
            }
            if (info.img !== undefined) {
                content_info += '<div class="a-poster"><img src="' + google_proxy + info.img + '" /></div>';
            }
            if (info.title !== undefined) {
                content_info += '<div class="a-title">' + info.title + '</div>';
            }
            if (info.type !== undefined) {
                content_info += '<div class="a-type">' + info.type + '</div>';
            }
            if (info.desc !== undefined) {
                content_info += '<div class="a-desc">' + info.desc + '</div>';
            }
            if (info.table !== undefined) {
                content_info += '<div class="a-table">' + info.table + '</div>';
            }
            if (content_info.length > 0)
                return view.contentUnFilter('<div>' + content_info + '</div>');
            else
                return '';
        };
        if (type === "about")
            return About(content);
    };
    var about_keyword = function(keyword) {
        if (keyword.length === 0)
            return;
        var ab_panel = $('div.about_panel');
        ab_panel.empty();
        var url = 'https://www.google.com/search?q=' + keyword;
        var type = "about";
        if (xhr[type] !== undefined)
            xhr[type].abort();
        xhr[type] = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                var content = read_content(type, data);
                ab_panel.html(content);
            }
        });
    };
    return {
        getAbout: function(k) {
            return about_keyword(k);
        },
        getLoad: function() {
            return;
        },
        setQuality: function() {
            return;
        },
        render_top: function() {
            return;
        }
    };
}();