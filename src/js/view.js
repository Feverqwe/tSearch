/**
 * Created by Anton on 08.03.2015.
 */
var view = {
    domCache: {
        requestInput: document.getElementById('request_input'),
        seedFilter: document.getElementById('seed_filter'),
        peerFilter: document.getElementById('peer_filter'),
        resultTableHead: document.getElementById('result_table_head'),
        resultTableBody: document.getElementById('result_table_body'),
        resultCategoryContainer: document.getElementById('result_category_container'),
        profileSelect: document.getElementById('profile_select'),
        trackerList: document.getElementById('tracker_list')
    },
    varCache: {
        resultTableColumnList: [
            {id: 'time',    size: 125, lang: 'columnTime'},
            {id: 'quality', size: 31,  lang: 'columnQuality'},
            {id: 'title',   size: 0,   lang: 'columnTitle'},
            {id: 'size',    size: 80,  lang: 'columnSize'},
            {id: 'seeds',   size: 30,  lang: 'columnSeeds'},
            {id: 'leechs',  size: 30,  lang: 'columnLeechs'}
        ],
        resultSortBy: 1,
        tableSortColumn: 'quality'
    },
    writeTableHead: function() {
        "use strict";
        var style = '';
        var sortBy = view.varCache.resultSortBy ? 'sortDown' : 'sortUp';
        view.domCache.resultTableHead.appendChild(mono.create('tr', {
            append: (function(){
                var thList = [];
                var hideList = [];
                if (engine.settings.hideSeedColumn) {
                    hideList.push('seeds');
                }
                if (engine.settings.hidePeerColumn) {
                    hideList.push('leechs');
                }
                for (var i = 0, item; item = view.varCache.resultTableColumnList[i]; i++) {
                    if (hideList.indexOf(item.id) !== -1) continue;
                    var order = view.varCache.tableSortColumn === item.id ? sortBy : null;
                    thList.push(mono.create('th', {
                        data: {
                            type: item.id
                        },
                        title: mono.language[item.lang],
                        class: [item.id, order],
                        append: mono.create('span', {
                            text: mono.language[item.lang + 'Short'] || mono.language[item.lang]
                        })
                    }));
                    if (item.size) {
                        style += '#result_table_head th.'+item.id+'{width:'+item.size+'px;}';
                    }
                }
                return thList;
            })()
        }));
        document.body.appendChild(mono.create('style', {
            class: 'thead_size',
            text: style
        }));
    },
    writeProfileList: function() {
        "use strict";
        view.domCache.profileSelect.textContent = '';
        mono.create(view.domCache.profileSelect, {
            append: (function(){
                var elList = [];
                for (var key in engine.profileList) {
                    elList.push(mono.create('option', {
                        text: key.replace('%defaultProfileName%', mono.language.label_def_profile),
                        value: key
                    }));
                }
                elList.push(mono.create('option', {
                    data: {
                        service: 'new'
                    },
                    text: mono.language.word_add
                }));
                return elList;
            })()
        });
    },
    selectProfile: function(key) {
        "use strict";
        var option = view.domCache.profileSelect.querySelector('option[value="'+key+'"]');
        if (!option) return;
        view.domCache.profileSelect.selectedIndex = option.index;

        view.domCache.trackerList.textContent = '';

        
    },
    once: function() {
        "use strict";
        mono.writeLanguage(mono.language);
        document.body.classList.remove('loading');
        view.domCache.requestInput.focus();

        view.writeTableHead();
        view.writeProfileList();

        view.selectProfile(engine.currentProfile);

        if (engine.settings.hideSeedColumn === 1) {
            view.domCache.seedFilter.style.display = 'none';
            view.domCache.seedFilter.previousElementSibling.style.display = 'none';
        }

        if (engine.settings.hidePeerColumn === 1) {
            view.domCache.peerFilter.style.display = 'none';
            view.domCache.peerFilter.previousElementSibling.style.display = 'none';
        }
    }
};
engine.init(function() {
    "use strict";
    view.once();
});