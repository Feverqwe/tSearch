/**
 * Created by Anton on 07.01.2017.
 */
"use strict";
define([
    './utils'
], function (utils) {
    var PageController = function (deatils) {
        var DEBUG = false;
        deatils = deatils || {};
        var self = this;
        var params = {};
        var load = function () {
            DEBUG && console.debug('load', location.href);
            var queryString = location.hash.substr(1);
            var queryObj = deatils.useHash ? utils.hashParseParam(queryString) : utils.parseUrl(queryString, {params: true});
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

        this.get = function (key) {
            DEBUG && console.debug('get', key, JSON.stringify(params));
            if (typeof params[key] === 'string') {
                return params[key];
            } else {
                return null;
            }
        };
        this.set = function (key, value) {
            if (typeof value === 'number') {
                value = value.toString();
            }
            DEBUG && console.debug('set', key, value);
            params[key] = value;
            return self;
        };
        this.remove = function (key) {
            DEBUG && console.debug('remove', key);
            delete params[key];
            return self;
        };
        this.clear = function () {
            DEBUG && console.debug('clear');
            for (var key in params) {
                delete params[key];
            }
            return self;
        };
        this.applyUrl = function () {};
        this.getUrl = function () {
            var url = location.origin + location.pathname;
            var hash =  deatils.useHash ? utils.hashParam(params) : utils.param(params);
            if (hash) {
                url += '#' + hash;
            }
            DEBUG && console.debug('getUrl', url);
            return url;
        };
        this.go = function () {
            var url = self.getUrl();
            window.history.pushState(null, "", url);
            DEBUG && console.debug('go', url);
            self.applyUrl();
        };
        load();
    };
    return PageController;
});