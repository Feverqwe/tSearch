/**
 * Created by Anton on 05.01.2017.
 */
define([
    './dom'
], function (dom) {
    var unique = function (value, index, self) {
        return self.indexOf(value) === index;
    };

    var filterTypeMap = {
        word: function (filter, torrent) {
            var result = true;
            if (filter.re[0]) {
                result = !filter.re[0].test(torrent.wordFilterLow);
            }
            if (result && filter.re[1]) {
                var m = torrent.wordFilterLow.match(filter.re[1]);
                result = m && m.filter(unique).length === filter.re[2];
            }
            return result;
        },
        size: function (filter, torrent) {
            var result = filter.min === 0 ? true : torrent.size >= filter.min;
            if (result && filter.max) {
                result = torrent.size <= filter.max;
            }
            return result;
        },
        date: function (filter, torrent) {
            var result = filter.min === 0 ? true : torrent.date >= filter.min;
            if (result && filter.max) {
                result = torrent.date <= filter.max;
            }
            return result;
        },
        seed: function (filter, torrent) {
            var result = filter.min === 0 ? true : torrent.seed >= filter.min;
            if (result && filter.max) {
                result = torrent.seed <= filter.max;
            }
            return result;
        },
        peer: function (filter, torrent) {
            var result = filter.min === 0 ? true : torrent.peer >= filter.min;
            if (result && filter.max) {
                result = torrent.peer <= filter.max;
            }
            return result;
        },
        tracker: function (filter, torrent) {
            var result = true;
            var trackerIds = filter.trackerIds;
            if (trackerIds.length) {
                result = trackerIds.indexOf(torrent.trackerId) !== -1;
            }
            return result;
        }
    };

    var stringifyTypeMap = {
        word: function (filter) {
            var _filter = {
                type: filter.type,
                re: new Array(3)
            };
            if (filter.re[0]) {
                _filter.re[0] = filter.re[0].toString();
            }
            if (filter.re[1]) {
                _filter.re[1] = filter.re[1].toString();
                _filter.re[2] = filter.re[2];
            }
            return _filter;
        }
    };

   var Filter = function (ee) {
       var self = this;
       var styleNode = dom.el('style', {
           class: ['style_filter'],
           text: ''
       });
       document.body.appendChild(styleNode);

       var tableRowSelector = '.table-results .body__row';

       var trackerFilter = {
           type: 'tracker',
           trackerIds: []
       };

       var filters = [];
       var activeFilters = JSON.stringify(filters);

       var stringifyFilter = function () {
           var _filters = filters.map(function (filter) {
               var stringifyFn = stringifyTypeMap[filter.type];
               if (stringifyFn) {
                   return stringifyFn(filter);
               } else {
                   return filter;
               }
           });
           return JSON.stringify(_filters);
       };

       this.remove = function (filter) {
           var pos = filters.indexOf(filter);
           if (pos !== -1) {
               filters.splice(pos, 1);
           }
       };

       this.add = function (filter) {
           var pos = filters.indexOf(filter);
           if (pos === -1) {
               filters.push(filter);
           }
       };

       this.addTracker = function (id) {
           var trackerIds = trackerFilter.trackerIds;
           var pos = trackerIds.indexOf(id);
           if (pos === -1) {
               trackerIds.push(id);
           }
           if (trackerIds.length) {
               self.add(trackerFilter);
           }
       };

       this.removeTracker = function (id) {
           var trackerIds = trackerFilter.trackerIds;
           var pos = trackerIds.indexOf(id);
           if (pos !== -1) {
               trackerIds.splice(pos, 1);
           }
           if (!trackerIds.length) {
               self.remove(trackerFilter);
           }
       };

       this.update = function () {
           var stringFilters = stringifyFilter();
           if (stringFilters !== activeFilters) {
               activeFilters = stringFilters;

               ee.trigger('filterChange');

               var style = [];

               if (filters.length) {
                   style.push(tableRowSelector + ':not([data-filter="true"]){display: none}');
               }

               styleNode.textContent = style.join('');
           }
       };

       this.getFilterValue = function (/**torrent*/torrent) {
           return filters.every(function (filter) {
               return filterTypeMap[filter.type](filter, torrent);
           });
       }
   };
   return Filter;
});