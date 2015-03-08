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
        resultCategoryContainer: document.getElementById('result_category_container')
    },
    varCache: {
        categoryList: [
            {id: undefined, lang: 'categoryAll'},
            {id:  3, lang: 'categoryFilms'},
            {id:  0, lang: 'categorySerials'},
            {id:  7, lang: 'categoryAnime'},
            {id:  8, lang: 'categoryDocumentary'},
            {id: 11, lang: 'categoryHumor'},
            {id:  1, lang: 'categoryMusic'},
            {id:  2, lang: 'categoryGames'},
            {id:  5, lang: 'categoryBooks'},
            {id:  4, lang: 'categoryCartoons'},
            {id:  6, lang: 'categorySoft'},
            {id:  9, lang: 'categorySport'},
            {id: 10, lang: 'categoryXXX'},
            {id: -1, lang: 'categoryOther'}
        ],
        categoryObj: {},
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
    writeCategory: function() {
        "use strict";
        mono.create(view.domCache.resultCategoryContainer, {
            append: (function() {
                var elList = [];
                for (var i = 0, item; item = view.varCache.categoryList[i]; i++) {
                    view.varCache.categoryObj[item.id] = item;
                    item.count = 0;
                    item.isHidden = 1;
                    var className = 'hide';
                    var data = {};
                    if (item.id === undefined) {
                        data.id = item.id;
                        className = 'selected'
                    }
                    elList.push(item.itemEl = mono.create('li', {
                        class: className,
                        data: data,
                        append: [
                            mono.create('a', {
                                href: '#',
                                text: mono.language[item.lang]
                            }),
                            item.countEl = mono.create('i', {
                                text: 0
                            })
                        ]
                    }));
                }
                return elList;
            })()
        });
    },
    once: function() {
        "use strict";
        mono.writeLanguage(mono.language);
        document.body.classList.remove('loading');
        view.domCache.requestInput.focus();

        view.writeTableHead();
        view.writeCategory();

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