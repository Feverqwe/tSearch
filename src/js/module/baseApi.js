/**
 * Created by anton on 14.01.17.
 */
define(function () {
    /**
     * @returns {DocumentFragment}
     */
    window.API_getDom = function (html) {
        var fragment = document.createDocumentFragment();
        var div = document.createElement('html');
        div.innerHTML = html;
        var el;
        while (el = div.firstChild) {
            fragment.appendChild(el);
        }
        return fragment;
    };

    (function () {
        var searchJs = /javascript/ig;
        var blockHref = /\/\//;
        var blockSrc = /src=(['"]?)/ig;
        var blockSrcSet = /srcset=(['"]?)/ig;
        var blockOnEvent = /on(\w+)=/ig;

        var deImg = /data:image\/gif,base64#blockurl#/g;
        var deUrl = /about:blank#blockurl#/g;
        var deJs = /tms-block-javascript/g;

        /**
         * @returns {string}
         */
        window.API_sanitizeHtml = function (str) {
            return str.replace(searchJs, 'tms-block-javascript')
                .replace(blockHref, '//about:blank#blockurl#')
                .replace(blockSrc, 'src=$1data:image/gif,base64#blockurl#')
                .replace(blockSrcSet, 'data-block-attr-srcset=$1')
                .replace(blockOnEvent, 'data-block-event-$1=');
        };

        /**
         * @returns {string}
         */
        window.API_deSanitizeHtml = function (str) {
            return str.replace(deImg, '')
                .replace(deUrl, '')
                .replace(deJs, 'javascript');
        };
    })();

    (function () {
        var parseUrl = function (pageUrl, details) {
            details = details || {};
            var pathname = /([^#?]+)/.exec(pageUrl)[1];
            var path = /(.+:\/\/.*)\//.exec(pathname);
            if (path) {
                path = path[1];
            } else {
                path = pageUrl;
            }
            path += '/';
            var result = {
                protocol: /(.+:)\/\//.exec(pathname)[1],
                origin: /(.+:\/\/[^\/]+)/.exec(pathname)[1],
                path: path,
                pathname: pathname
            };
            if (details.origin) {
                result.origin = details.origin;
            }
            if (details.path) {
                result.path = details.path;
            }
            return result;
        };
        var urlParseCache = {};
        /**
         * @returns {string}
         */
        window.API_normalizeUrl = function (pageUrl, value, details) {
            if (/^magnet:/.test(value)) {
                return value;
            }
            if (/^http/.test(value)) {
                return value;
            }

            var parsedUrl = urlParseCache[pageUrl];
            if (!parsedUrl) {
                parsedUrl = urlParseCache[pageUrl] = parseUrl(pageUrl, details)
            }

            if (/^\/\//.test(value)) {
                return parsedUrl.protocol + value;
            }
            if (/^\//.test(value)) {
                return parsedUrl.origin + value;
            }
            if (/^\.\//.test(value)) {
                return parsedUrl.path + value.substr(2);
            }
            if (/^\?/.test(value)) {
                return parsedUrl.pathname + value;
            }
            return parsedUrl.path + value;
        };
    })();
});