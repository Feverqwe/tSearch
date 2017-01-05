/**
 * Created by Anton on 05.01.2017.
 */
"use strict";
define([
    './utils'
], function (utils) {
    var isPunctuation = function (char) {
        if (char === undefined) {
            return true;
        }
        var code = char.charCodeAt(0);
        if (code > 31 && code < 48) {
            return true;
        }
        if (code > 126 || code < 31) {
            return false;
        }
        if (code > 57 && code < 65) {
            return true;
        }
        if (code > 90 && code < 97) {
            return true;
        }
        if (code > 122 && code < 127) {
            return true;
        }
        if ([171, 174, 169, 187, 8222, 8221, 8220].indexOf(code) !== -1) {
            return true;
        }
        return false;
    };
    var isBoundary = function(leftChar, rightChar) {
        return isPunctuation(leftChar) && isPunctuation(rightChar);
    };
    var highlight = {
        getMap: function (query) {
            var words = query.split(/\s+/);
            var word;
            var wordsRe = [];
            for (var i = 0, len = words.length; i < len; i++) {
                word = utils.sanitizeTextRe(words[i]);
                if (word) {
                    wordsRe.push(word);
                }
            }
            wordsRe.sort(function(a, b){
                return a.length > b.length ? -1 : 1;
            });
            return new RegExp(wordsRe.join('|'), 'ig');
        },
        getHlMap: function (string, map, posMap) {
            var wordLen;
            string.replace(map, function (word, pos) {
                wordLen = word.length;
                if (wordLen && isBoundary(string[pos - 1], string[pos + wordLen])) {
                    posMap.push(['b', pos]);
                    posMap.push(['b', pos + wordLen, true]);
                }
            });
        },
        getBracketsMap: function (string, posMap) {
            var wordLen;
            string.replace(/\([^)]*\)|\[[^\]]*]|<[^>]*>|{[^}]*}/g, function (word, pos) {
                wordLen = word.length;
                if (wordLen) {
                    posMap.push(['span', pos]);
                    posMap.push(['span', pos + wordLen, true]);
                }
            });
        },
        insert: function (/**String*/str, map) {
            var posMap = [];
            this.getHlMap(str, map, posMap);
            this.getBracketsMap(str, posMap);
            posMap.sort(function (a, b) {
                return a[1] === b[1] ? 0 : a[1] < b[1] ? -1 : 1;
            });

            var fragment, root, level = 0, lastPos = 0;
            fragment = root = document.createDocumentFragment();
            var item, tagName, pos, isClose, fragmentLen;
            for (var i = 0, len = posMap.length; i < len; i++) {
                item = posMap[i];
                tagName = item[0];
                pos = item[1];
                isClose = item[2];
                if (pos !== lastPos) {
                    fragment.appendChild(document.createTextNode(str.substr(lastPos, pos - lastPos)));
                }
                lastPos = pos;
                if (!isClose) {
                    fragment.appendChild(fragment = document.createElement(tagName));
                } else {
                    fragment = fragment.parentNode || root;
                }
            }
            pos = str.length;
            if (pos !== lastPos) {
                fragment.appendChild(document.createTextNode(str.substr(lastPos, pos - lastPos)));
            }

            return fragment;
        }
    };
    return highlight;
});