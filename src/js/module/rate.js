/**
 * Created by Anton on 02.04.2015.
 */
"use strict";
define([
    './utils'
], function (utils) {
    var rate = {
        rating: [

        ],
        template: {
            bitrate: [
                {
                    list: ['32'],
                    rate: {audio: -2}
                },
                {
                    list: ['64'],
                    rate: {audio: 0}
                },
                {
                    list: ['96'],
                    rate: {audio: 2}
                },
                {
                    list: ['128'],
                    rate: {audio: 5}
                },
                {
                    list: ['192'],
                    rate: {audio: 10}
                },
                {
                    list: ['320'],
                    rate: {audio: 15}
                }
            ]
        },
        defaultQualityList: [
            /*{
             list: [],
             rate: {
             video: 0,
             music: 0,
             games: 0,
             books: 0,
             serials: 0,
             cartoons: 0,
             xxx: 0
             },
             name: '',
             sub: [],
             subAfter: [],
             subBefore: []
             },*/
            {
                list: ['blu-ray cee'],
                rate: {
                    video: 105
                },
                name: 'Blu-ray CEE'
            },
            {
                list: ['blu-ray'],
                rate: {
                    video: 100
                },
                name: 'Blu-ray'
            },
            {
                list: ['bd-remux', 'bd remux', 'BDRemux'],
                rate: {
                    video: 90
                },
                name: 'BDRemux'
            },
            {
                list: ['BDRip-AVC', 'BD-Rip', 'BDRip'],
                rate: {
                    video: 80
                },
                name: 'BDRip'
            },
            {
                list: ['CAMRip', 'CamRip-AVC'],
                rate: {
                    video: 10
                },
                name: 'CAMRip'
            },
            {
                list: ['HDTV-Rip', 'HDTVRip'],
                rate: {
                    video: 70
                },
                name: 'HDTV-Rip'
            },
            {
                list: ['DTheater-Rip'],
                rate: {
                    video: 70
                },
                name: 'DTheater-Rip'
            },
            {
                list: ['LowHDRip', 'VHSRip'],
                rate: {
                    video: 10
                },
                name: 'LowHDRip'
            },
            {
                list: [{word: 'HDTV'}, 'HDRip', 'HDRip-AVC'],
                rate: {
                    video: 60
                },
                name: 'HDTV'
            },
            {
                list: ['DVDRip', 'DVD-Rip', 'DVDRip-AVC'],
                rate: {
                    video: 60
                },
                name: 'DVD-Rip'
            },
            {
                list: ['HD-DVD'],
                rate: {
                    video: 68
                },
                name: 'HD-DVD'
            },
            {
                list: [{regexp: 1, word: '\\d\\s?[x\\*]\\s?DVD\\-?9', caseSens: 0}],
                rate: {
                    video: 65
                },
                name: 'DVD-9'
            },
            {
                list: [{regexp: 1, word: '\\d\\s?[x\\*]\\s?DVD\\-?5', caseSens: 0}],
                rate: {
                    video: 53
                },
                name: 'DVD-5'
            },
            {
                list: [{word: 'DVD'}],
                rate: {
                    video: 50
                },
                name: 'DVD'
            },
            {
                list: ['HQSATRip', 'HQRip', 'HQRip-AVC'],
                rate: {
                    video: 44
                },
                name: 'HDrip'
            },
            {
                list: ['TVRip', 'IPTVRip'],
                rate: {
                    video: 40
                },
                name: 'TV-Rip'
            },
            {
                list: ['WEBRip'],
                rate: {
                    video: 40
                },
                name: 'WebRip'
            },
            {
                list: ['WEB-DLRip-AVC', 'WebDL-Rip', 'WEB-DLRip', 'WEB-DL'],
                rate: {
                    video: 40
                },
                name: 'WEB-DL'
            },
            {
                list: ['SATRip'],
                rate: {
                    video: 40
                },
                name: 'SAT-Rip'
            },
            {
                list: [{word: 'DVB'}],
                rate: {
                    video: 40
                },
                name: 'DVB'
            },
            {
                list: [{word: 'TS'}, 'TeleSynch'],
                rate: {
                    video: 20
                },
                name: 'Telesync'
            },
            {
                list: ['DVDScr', 'DVDScreener'],
                rate: {
                    video: 20
                },
                name: 'DVD-Screener'
            },
            {
                list: ['lossless'],
                rate: {
                    audio: 100
                },
                name: 'lossless',
                subAfter: [
                    {
                        list: ['repack'],
                        rate: {
                            audio: -100
                        }
                    }
                ]
            },
            {
                list: ['FLAC', 'ALAC'],
                rate: {
                    music: 100
                },
                name: 'lossless'
            },
            {
                list: ['MP3'],
                rate: {
                    music: 80
                },
                name: 'MP3',
                subAfter: "bitrate"
            },
            {
                list: ['AAC'],
                rate: {
                    audio: 85
                },
                name: 'AAC',
                subAfter: "bitrate"
            },
            {
                list: [{word: 'PS3'}],
                rate: {
                    games: 80
                },
                name: 'PS3'
            },
            {
                list: ['XBOX'],
                rate: {
                    games: 80
                },
                name: 'XBox'
            },
            {
                list: [{word: 'PS2'}, '(ps2)'],
                rate: {
                    games: 80
                },
                name: 'PS2'
            },
            {
                list: ['[p]', '{p}', '(p)'],
                rate: {
                    games: 20
                },
                name: 'P'
            },
            {
                list: ['repack', 'lossless repack', 'steamrip', 'steam-rip', '(lossy rip)', 'reloaded'],
                rate: {
                    games: 60
                },
                name: 'RePack'
            },
            {
                list: ['[Native]'],
                rate: {
                    games: 100
                },
                name: 'Native'
            },
            {
                list: ['[rip]', '{rip}', '(rip)'],
                rate: {
                    games: 80
                },
                name: 'Rip'
            },
            {
                list: [{word: '[L]'}, {word: '{L}'}, {word: '(L)'}],
                rate: {
                    games: 100
                },
                name: 'L'
            },
            {
                list: ['fb2', 'pdf', 'djvu', 'rtf', 'epub', 'doc', 'docx'],
                rate: {
                    books: 100
                },
                name: 'Book'
            },
            {
                list: ['h.264', 'h264', 'mp4', 'm4v'],
                rate: {
                    video: 2
                }
            },
            {
                list: ['2160p', '2160i'],
                rate: {
                    video: 20
                }
            },
            {
                list: ['1080p', '1080i'],
                rate: {
                    video: 20
                }
            },
            {
                list: ['720p'],
                rate: {
                    video: 10
                }
            },
            {
                list: ['720p-LQ'],
                rate: {
                    video: -5
                }
            },
            {
                list: ['звук с ts'],
                rate: {
                    video: -50
                }
            },
            {
                list: [{word: 'СТ'}, 'sub', 'subs'],
                rate: {
                    video: 1
                }
            },
            {
                list: ['itunes russia', 'itunes lp'],
                rate: {
                    video: 10
                }
            },
            {
                list: [{word: 'DUB'}, {word: 'Dub'}, {word: 'ДБ'}, {word: 'ПО'}, {word: 'ПД'}, '2xDub'],
                rate: {
                    video: 3
                }
            },
            {
                list: [{word: 'ПМ'}],
                rate: {
                    video: 2
                }
            },
            {
                list: [{word: 'АП'}, {word: 'ЛО'}, {word: 'ЛД'}, {word: 'VO'}],
                rate: {
                    video: 1
                }
            },
            {
                list: ['pc (windows)'],
                rate: {
                    games: 5
                }
            },
            {
                list: ['сезон', 'season'],
                rate: {
                    serials: 1
                }
            },
            {
                list: [{word: 'CUE'}, '.cue'],
                rate: {
                    music: 20
                }
            },
            {
                list: ['soundtrack'],
                rate: {
                    music: 1
                }
            },
            {
                list: ['мультфильм'],
                rate: {
                    cartoons: 1
                }
            },
            {
                list: ['чистый звук'],
                rate: {
                    video: 2
                }
            },
            {
                list: ['обновляемая'],
                rate: {
                    serials: 5
                }
            }
        ],
        qualityList: {},
        /**
         *
         * @param [qualityList] Array
         * @param [type] String
         * @returns {{}|{wordsRe: object, scope: object, scopeCase: object}}
         */
        readQualityList: function(qualityList, type) {
            type = type || '';
            var wordsRe = [];
            var scope = {};
            var scopeCase = {};
            var tmpScopeRegexp = [];
            qualityList.forEach(function(qualityObj) {
                if (qualityObj.list !== undefined) {
                    qualityObj.list.forEach(function(wordItem) {
                        if (typeof wordItem === 'string') {
                            /**
                             * List item in qualityList
                             * @type {{word: String, caseSens: Number, regexp: Number}}
                             */
                            wordItem = {word: wordItem, caseSens: 0};
                        }
                        if (wordItem.regexp === 1) {
                            wordsRe.push(wordItem.word);
                            var caseSens = 'g';
                            if (wordItem.caseSens !== 0) {
                                caseSens += 'i';
                            }
                            tmpScopeRegexp.push([new RegExp(wordItem.word, caseSens), qualityObj]);
                        } else {
                            if (wordItem.caseSens !== 0) {
                                if (scopeCase[wordItem.word] !== undefined) {
                                    console.log('Word case conflict!', wordItem);
                                }
                                scopeCase[wordItem.word] = qualityObj;
                            } else {
                                wordItem.word = wordItem.word.toLowerCase();
                                if (scope[wordItem.word] !== undefined) {
                                    console.log('Word conflict!', wordItem);
                                }
                                scope[wordItem.word] = qualityObj;
                            }
                            wordsRe.push(utils.sanitizeTextRe(wordItem.word));
                        }
                    });
                }
                var subList = [];
                if (qualityObj.sub !== undefined) {
                    if (typeof qualityObj.sub === 'string') {
                        qualityObj.sub = rate.template[qualityObj.sub];
                    }
                    utils.extend(qualityObj, rate.readQualityList(qualityObj.sub, 'sub'));
                    subList.push('sub');
                }
                if (qualityObj.subAfter !== undefined) {
                    if (typeof qualityObj.subAfter === 'string') {
                        qualityObj.subAfter = rate.template[qualityObj.subAfter];
                    }
                    utils.extend(qualityObj, rate.readQualityList(qualityObj.subAfter, 'subAfter'));
                    subList.push('subAfter');
                }
                if (qualityObj.subBefore !== undefined) {
                    if (typeof qualityObj.subBefore === 'string') {
                        qualityObj.subBefore = rate.template[qualityObj.subBefore];
                    }
                    utils.extend(qualityObj, rate.readQualityList(qualityObj.subBefore, 'subBefore'));
                    subList.push('subBefore');
                }
                if (subList.length !== 0) {
                    qualityObj.subList = subList;
                }
            });
            if (wordsRe.length > 0) {
                wordsRe = new RegExp(wordsRe.sort(function(a, b) {
                    return String(a).length > String(b).length ? -1 : 1
                }).join('|'), 'ig');
            } else {
                wordsRe = undefined;
            }

            var scopeRegexpIndex;
            var scopeRegexp;
            if (tmpScopeRegexp.length > 0) {
                scopeRegexp = [];
                scopeRegexpIndex = [];
                tmpScopeRegexp.sort(function(a, b) {
                    return String(a[0]).length > String(b[0]).length ? -1 : 1
                });
                for (var i = 0, item; item = tmpScopeRegexp[i]; i++) {
                    scopeRegexp.push(item[0]);
                    scopeRegexpIndex.push(item[1]);
                }
                tmpScopeRegexp = null;
            }
            var rObj = {};
            wordsRe && (rObj['wordsRe'+type] = wordsRe);
            !utils.isEmptyObject(scope) && (rObj['scope'+type] = scope);
            !utils.isEmptyObject(scopeCase) && (rObj['scopeCase'+type] = scopeCase);
            if (scopeRegexp) {
                rObj['scopeRegexp'+type] = scopeRegexp;
                rObj['scopeRegexpIndex'+type] = scopeRegexpIndex;
            }
            return rObj;
        },
        baseQualityList: {},
        getScheme: function (query) {
            var scheme = {};

            scheme.query = query;

            scheme.words = [];
            query.split(/[-\s]+/).forEach(function (word) {
                while (word.length && utils.isPunctuation(word[0])) {
                    word = word.substr(1);
                }
                while (word.length && utils.isPunctuation(word.slice(-1))) {
                    word = word.slice(0, -1);
                }
                if (word.length) {
                    scheme.words.push(word);
                }
            });

            scheme.wordsCase = scheme.words.map(function (word) {
                var firstChar = word[0];
                if (firstChar && firstChar.toUpperCase() === firstChar) {
                    return firstChar;
                } else {
                    return null;
                }
            });

            scheme.wordsLow = scheme.words.map(function (word) {
                return word.toLowerCase();
            });

            scheme.years = scheme.wordsLow.filter(function (word) {
                return /\d{4}/.test(word);
            });

            scheme.wordsRe = scheme.words.slice(0).sort(function(a, b){
                return a.length > b.length ? -1 : 1
            }).map(function (word) {
                return utils.sanitizeTextRe(word);
            });
            scheme.wordsRe = new RegExp(scheme.wordsRe.join('|'), 'ig');

            scheme.wordsSpaces = new Array(scheme.wordsLow.length);

            var words = scheme.words.slice(0);
            var lastWordEndPos = null;
            query.replace(scheme.wordsRe, function (word, pos, str) {
                var wordLen = word.length;
                if (!word || !utils.isBoundary(str[pos - 1], str[pos + wordLen])) {
                    return '';
                }

                var index = words.indexOf(word);
                if (index !== -1) {
                    words.splice(index, 1, null);

                    if (lastWordEndPos === null) {
                        lastWordEndPos = pos - 1;
                    }

                    scheme.wordsSpaces[index] = pos - lastWordEndPos;
                    lastWordEndPos = pos + wordLen;
                }
            });

            return scheme;
        },
        getReplace: function (rating, qualityList, matched) {
            matched = matched || [];
            return function () {
                var word = arguments[0];
                var wordLen = word.length;

                var argLen = arguments.length;
                var pos = arguments[argLen - 2];
                var str = arguments[argLen - 1];

                if (!word || !utils.isBoundary(str[pos - 1], str[pos + wordLen])) {
                    return '';
                }

                var wordLowCase;
                var qualityObj = qualityList.scopeCase && qualityList.scopeCase[word];
                if (!qualityObj) {
                    wordLowCase = word.toLowerCase();
                    qualityObj = qualityList.scope && qualityList.scope[wordLowCase];
                    if (qualityObj) {
                        word = wordLowCase;
                    }
                }

                qualityList.scopeRegexp && qualityList.scopeRegexp.some(function(regexp, index) {
                    if (regexp.test(word)) {
                        qualityObj = qualityList.scopeRegexpIndex[index];
                        return true;
                    }
                });

                if (!qualityObj) {
                    return '';
                }

                if (matched.indexOf(word) !== -1) {
                    return '';
                }
                matched.push(word);

                if (qualityObj.name) {
                    if (!rating.quality) {
                        rating.quality = qualityObj.name;
                    } else {
                        return '';
                    }
                }

                for (var key in qualityObj.rate) {
                    if (!rating.rate[key]) {
                        rating.rate[key] = 0;
                    }
                    rating.rate[key] += qualityObj.rate[key];
                }

                var subText;
                if (qualityObj.subList) {
                    for (var m = 0, type; type = qualityObj.subList[m]; m++) {
                        if (type === 'subAfter') {
                            subText = str.substr(pos + wordLen);
                        } else
                        if (type === 'subBefore') {
                            subText = str.substr(0, pos);
                        } else {
                            subText = str;
                        }
                        if (subText) {
                            subText.replace(qualityObj['wordsRe' + type], rate.getReplace(rating, {
                                scope: qualityObj['scope'+type],
                                scopeCase: qualityObj['scopeCase'+type],
                                scopeRegexp: qualityObj['scopeRegexp'+type],
                                scopeRegexpIndex: qualityObj['scopeRegexpIndex'+type]
                            }, matched));
                        }
                    }
                }
            };
        },
        getTitleReplace: function (rating, scheme) {
            var words = scheme.words;
            var wordsLen = words.length;
            var wordsCase = scheme.wordsCase;
            var wordsLow = scheme.wordsLow.slice(0);
            var wordRate = 100 / wordsLen;
            var wordsSpaces = scheme.wordsSpaces;
            rating.rate.title = 0;
            rating.rate.wordSpaces = 0;
            rating.rate.wordOrder = 0;
            rating.rate.caseSens = 0;
            var lastWordEndPos = null;
            var wordIndex = 0;
            return function (word, pos, str) {
                var wordLen = word.length;
                if (!word || !utils.isBoundary(str[pos - 1], str[pos + wordLen])) {
                    return '';
                }

                var wordLow = word.toLowerCase();

                var index = wordsLow.indexOf(wordLow);
                if (index !== -1) {
                    wordsLow.splice(index, 1, null);

                    var isYear = scheme.years.indexOf(wordLow) !== -1;

                    rating.rate.title += wordRate;

                    if (!isYear) {
                        if (lastWordEndPos === null) {
                            lastWordEndPos = pos - 1;
                        }

                        var spaceSize = pos - lastWordEndPos;
                        var spaceCount = wordsSpaces[index];
                        if (spaceCount > spaceSize) {
                            spaceSize = spaceCount;
                        }
                        rating.rate.wordSpaces += spaceCount / spaceSize * wordRate;
                        lastWordEndPos = pos + wordLen;
                    } else {
                        rating.rate.wordSpaces += wordRate;
                    }

                    if (wordIndex === index) {
                        rating.rate.wordOrder += wordRate;
                    }

                    var queryWord = wordsCase[index];
                    if (queryWord && wordsCase === word[0]) {
                        rating.rate.caseSens += wordRate;
                    }

                    wordIndex++;
                }
            };
        },
        getRate: function (torrent, scheme) {
            var rating = {
                rate: {},
                sum: 0
            };

            /*torrent.title.replace(rate.baseQualityList.wordsRe, rate.getReplace(rating, rate.baseQualityList));

            if (!rating.quality) {
                rating.quality = '+';
            }*/

            if (torrent.title.indexOf(scheme.query) !== -1) {
                rating.rate.title = 100;
                rating.rate.wordSpaces = 100;
                rating.rate.wordOrder = 100;
                rating.rate.caseSens = 100;
            } else {
                torrent.title.replace(scheme.wordsRe, rate.getTitleReplace(rating, scheme));
            }

            for (var item in rating.rate) {
                rating.sum += rating.rate[item];
            }

            return rating.sum;
        },
        init: function () {
            /**
             * @type {{wordsRe: Object, scope: Object, scopeCase: Object}}
             */
            if (utils.isEmptyObject(this.qualityList)) {
                this.qualityList = this.defaultQualityList;
            }
            this.baseQualityList = this.readQualityList(this.qualityList);
        }
    };
    rate.init();
    return rate;
});