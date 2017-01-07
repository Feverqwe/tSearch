/**
 * Created by Anton on 07.01.2017.
 */
"use strict";
define([
    './utils'
], function (utils) {
    var PageController = function (ee) {
        var self = this;
        var params = {};
        var load = function () {
            var queryString = location.hash.substr(1);
            var queryObj = utils.hashParseParam(queryString);
            var value;
            for (var key in queryObj) {
                value = queryObj[key];
                // legacy support
                if (key === '?query') {
                    key = 'query';
                }
                if (key) {
                    params[key] = value;
                }
            }
        };

        window.addEventListener('popstate', function () {
            self.clear();
            load();
            self.applyUrl();
        });

        this.getTitle = function () {};
        this.get = function (key) {
            if (typeof params[key] === 'string') {
                return params[key];
            } else {
                return null;
            }
        };
        this.set = function (key, value) {
            params[key] = value;
            return self;
        };
        this.remove = function (key) {
            delete  params[key];
            return self;
        };
        this.clear = function () {
            for (var key in params) {
                delete params[key];
            }
            return self;
        };
        this.applyUrl = function () {
            var title = document.title = self.getTitle();

            var profileId = self.get('profileId');
            ee.trigger('selectProfileById', [profileId]);

            var query = self.get('query');
            if (typeof query === 'string') {
                ee.trigger('setSearchQuery', [query]);
                ee.trigger('search', [query]);
            } else {
                ee.trigger('stateReset');
            }

            var url = self.getUrl();

            history.replaceState(null, title, url);
        };
        this.getUrl = function () {
            var url = location.origin + location.pathname;
            var hash = utils.param(params);
            if (hash) {
                url += '#' + hash;
            }
            return url;
        };
        this.go = function () {
            var url = self.getUrl();
            window.history.pushState(null, "", url);
            self.applyUrl();
        };
        load();
    };
    return PageController;
});