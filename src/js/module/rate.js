/**
 * Created by Anton on 02.04.2015.
 */
"use strict";
define([
    './utils'
], function (utils) {
    var rate = {
        rating: [
            {name: 'videoFormat', rules: [
                {
                    match: ['DCPRip'],
                    value: 100,
                    name: 'DCPRip'
                },
                {
                    match: ['blu-ray cee', {word: 'CEE'}],
                    value: 100,
                    name: 'Blu-ray CEE'
                },
                {
                    match: ['blu-ray'],
                    value: 98,
                    name: 'Blu-ray'
                },
                {
                    match: ['bd-remux', 'bd remux', 'BDRemux'],
                    value: 95,
                    name: 'BDRemux'
                },
                {
                    match: ['BDRip-AVC', 'BD-Rip', 'BDRip'],
                    value: 90,
                    name: 'BDRip'
                },
                {
                    match: ['CAMRip', 'CamRip-AVC'],
                    value: 10,
                    name: 'CAMRip'
                },
                {
                    match: ['HDTV-Rip', 'HDTVRip'],
                    value: 60,
                    name: 'HDTV-Rip'
                },
                {
                    match: ['DTheater-Rip'],
                    value: 60,
                    name: 'DTheater-Rip'
                },
                {
                    match: ['LowHDRip', 'VHSRip'],
                    value: 10,
                    name: 'LowHDRip'
                },
                {
                    match: [{word: 'HDTV'}, 'HDRip', 'HDRip-AVC'],
                    value: 50,
                    name: 'HDTV'
                },
                {
                    match: ['DVDRip', 'DVD-Rip', 'DVDRip-AVC'],
                    value: 50,
                    name: 'DVD-Rip'
                },
                {
                    match: ['HD-DVD'],
                    value: 55,
                    name: 'HD-DVD'
                },
                {
                    match: [{regexp: 1, word: '\\d\\s?[x\\*]\\s?DVD\\-?9', caseSens: 0}],
                    value: 50,
                    name: 'DVD-9'
                },
                {
                    match: [{regexp: 1, word: '\\d\\s?[x\\*]\\s?DVD\\-?5', caseSens: 0}],
                    value: 45,
                    name: 'DVD-5'
                },
                {
                    match: [{word: 'DVD'}],
                    value: 40,
                    name: 'DVD'
                },
                {
                    match: ['HQSATRip', 'HQRip', 'HQRip-AVC'],
                    value: 38,
                    name: 'HDrip'
                },
                {
                    match: ['TVRip', 'IPTVRip'],
                    value: 35,
                    name: 'TV-Rip'
                },
                {
                    match: ['WEBRip'],
                    value: 35,
                    name: 'WebRip'
                },
                {
                    match: ['WEB-DLRip-AVC', 'WebDL-Rip', 'WEB-DLRip', 'WEB-DL'],
                    value: 35,
                    name: 'WEB-DL'
                },
                {
                    match: ['SATRip'],
                    value: 35,
                    name: 'SAT-Rip'
                },
                {
                    match: [{word: 'DVB'}],
                    value: 35,
                    name: 'DVB'
                },
                {
                    match: [{word: 'TS'}, 'TeleSynch'],
                    value: 15,
                    name: 'Telesync'
                },
                {
                    match: ['DVDScr', 'DVDScreener'],
                    value: 15,
                    name: 'DVD-Screener'
                }
            ], after: [
                {name: 'videoQuality', rules: [
                    {
                        match: ['4k', '2k'],
                        value: 100
                    },
                    {
                        match: ['2160p', '2160i'],
                        value: 100
                    },
                    {
                        match: ['1080p', '1080i'],
                        value: 90
                    },
                    {
                        match: ['720p'],
                        value: 50
                    },
                    {
                        match: ['HD'],
                        value: 40
                    },
                    {
                        match: ['SD'],
                        value: 20
                    }
                ]}
            ]},
            {name: 'audioFormat', rules: [
                {
                    match: ['ALAC'],
                    value: 100,
                    name: 'ALAC'
                },
                {
                    match: ['FLAC'],
                    value: 100,
                    name: 'FLAC'
                },
                {
                    match: ['APE'],
                    value: 100,
                    name: 'APE'
                },
                {
                    match: ['AAC'],
                    value: 90,
                    name: 'MP3'
                },
                {
                    match: ['MP3'],
                    value: 80,
                    name: 'MP3'
                }
            ], after: [
                {name: 'audioQuality', rules: [
                    {
                        match: ['320'],
                        value: 100
                    },
                    {
                        match: ['192'],
                        value: 70
                    },
                    {
                        match: ['128'],
                        value: 50
                    },
                    {
                        match: ['96'],
                        value: 30
                    },
                    {
                        match: ['64'],
                        value: 15
                    },
                    {
                        match: ['32'],
                        value: 10
                    }
                ]}
            ]}
        ],
        qualityList: {},
        /**
         *
         * @param [qualityList] Array
         * @param [type] String
         * @returns {{}|{wordsRe: object, scope: object, scopeCase: object}}
         */
        readQualityList: function(qualityList) {
            var wordsRe = null;
            var words = [];
            var wordsReTest = [];
            var scope = {};
            var scopeCase = {};
            qualityList.forEach(function (section) {
                section.rules.forEach(function (qualityObj, index) {
                    qualityObj.section = section;
                    qualityObj.index = index;
                    qualityObj.match && qualityObj.match.forEach(function (wordObj) {
                        if (typeof wordObj === 'string') {
                            wordObj = {word: wordObj, caseSens: false};
                        }

                        if (wordObj.regexp === 1) {
                            words.push(wordObj.word);
                            var caseSens = 'g';
                            if (wordObj.caseSens) {
                                caseSens += 'i';
                            }
                            wordsReTest.push({
                                re: new RegExp(wordObj.word, caseSens),
                                qualityObj: qualityObj
                            });
                        } else {
                            if (!wordObj.caseSens) {
                                wordObj.word = wordObj.word.toLowerCase();
                                if (!scope[wordObj.word]) {
                                    scope[wordObj.word] = qualityObj;
                                } else {
                                    console.log('Word conflict!', wordObj);
                                }
                            } else {
                                if (!scopeCase[wordObj.word]) {
                                    scopeCase[wordObj.word] = qualityObj;
                                } else {
                                    console.log('Word case conflict!', wordObj);
                                }
                            }
                            words.push(utils.sanitizeTextRe(wordObj.word));
                        }
                    });
                });

                if (section.after) {
                    section.after = rate.readQualityList(section.after);
                }
            });

            if (words.length) {
                wordsRe = new RegExp(words.sort(function(a, b) {
                    return a.length > b.length ? -1 : 1
                }).join('|'), 'ig');
            }

            var scopeRegexpIndex = [];
            var scopeRegexp = [];
            if (wordsReTest.length) {
                wordsReTest.sort(function(a, b) {
                    return String(a.re).length > String(b.re).length ? -1 : 1
                });
                wordsReTest.forEach(function (item) {
                    scopeRegexp.push(item.re);
                    scopeRegexpIndex.push(item.qualityObj);
                });
            }

            var result = {};
            result.wordsRe = wordsRe;
            result.scope = !utils.isEmptyObject(scope) && scope;
            result.scopeCase = !utils.isEmptyObject(scopeCase) && scopeCase;
            result.scopeRegexp = scopeRegexp.length && scopeRegexp;
            result.scopeRegexpIndex = scopeRegexpIndex;

            return result;
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
            var lastSectionIndex = {};
            var lastQuality = '';

            return function () {
                var word = arguments[0];
                var wordLen = word.length;

                var argLen = arguments.length;
                var pos = arguments[argLen - 2];
                var str = arguments[argLen - 1];

                if (!word || !utils.isBoundary(str[pos - 1], str[pos + wordLen])) {
                    return '';
                }

                var qualityObj = qualityList.scopeCase && qualityList.scopeCase[word];

                if (!qualityObj && qualityList.scope) {
                    var wordLowCase = word.toLowerCase();
                    qualityObj = qualityList.scope[wordLowCase];
                    if (qualityObj) {
                        word = wordLowCase;
                    }
                }

                if (matched.indexOf(word) !== -1) {
                    return '';
                }

                if (!qualityObj && qualityList.scopeRegexp) {
                    qualityList.scopeRegexp.some(function (re, index) {
                        if (re.test(word)) {
                            qualityObj = qualityList.scopeRegexpIndex[index];
                            return true;
                        }
                    });
                }

                if (!qualityObj) {
                    return '';
                }

                matched.push(word);

                var section = qualityObj.section;
                var sectionName = section.name;
                if (!lastSectionIndex[sectionName]) {
                    lastSectionIndex[sectionName] = -1;
                }

                if (qualityObj.index > lastSectionIndex[sectionName]) {
                    lastSectionIndex[sectionName] = qualityObj.index;
                    rating.rate[sectionName] = qualityObj.value;
                    if (qualityObj.name) {
                        lastQuality && rating.quality.splice(rating.quality.indexOf(lastQuality), 1);
                        rating.quality.push(qualityObj.name);
                        lastQuality = qualityObj.name;
                    }

                    if (section.after) {
                        str.replace(section.after.wordsRe, rate.getReplace(rating, section.after, matched));
                    }
                }

                return '';
            };
        },
        getTitleReplace: function (rating, scheme) {
            var words = scheme.words;
            var wordsLen = words.length;
            var wordsCase = scheme.wordsCase;
            var wordsLow = scheme.wordsLow.slice(0);
            var wordRate = 100 / wordsLen;
            var wordsSpaces = scheme.wordsSpaces;
            rating.queryRate.title = 0;
            rating.queryRate.wordSpaces = 0;
            rating.queryRate.wordOrder = 0;
            rating.queryRate.caseSens = 0;
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

                    rating.queryRate.title += wordRate;

                    if (!isYear) {
                        if (lastWordEndPos === null) {
                            lastWordEndPos = pos - 1;
                        }

                        var spaceSize = pos - lastWordEndPos;
                        var spaceCount = wordsSpaces[index];
                        if (spaceCount > spaceSize) {
                            spaceSize = spaceCount;
                        }
                        rating.queryRate.wordSpaces += spaceCount / spaceSize * wordRate;
                        lastWordEndPos = pos + wordLen;
                    } else {
                        rating.queryRate.wordSpaces += wordRate;
                    }

                    if (wordIndex === index) {
                        rating.queryRate.wordOrder += wordRate;
                    }

                    var queryWord = wordsCase[index];
                    if (queryWord && wordsCase === word[0]) {
                        rating.queryRate.caseSens += wordRate;
                    }

                    wordIndex++;
                }
            };
        },
        getRate: function (torrent, scheme) {
            var rating = {
                quality: [],
                queryRate: {
                    title: 0,
                    wordSpaces: 0,
                    wordOrder: 0,
                    caseSens: 0
                },
                rate: {},
                sum: 0
            };

            if (torrent.title.indexOf(scheme.query) !== -1) {
                rating.queryRate.title = 100;
                rating.queryRate.wordSpaces = 100;
                rating.queryRate.wordOrder = 100;
                rating.queryRate.caseSens = 100;
            } else {
                torrent.title.replace(scheme.wordsRe, rate.getTitleReplace(rating, scheme));
            }

            var count = 0;
            var coefficient = 0;
            for (var item in rating.queryRate) {
                coefficient += rating.queryRate[item];
                count++;
            }
            coefficient = coefficient / count;

            torrent.title.replace(rate.baseQualityList.wordsRe, rate.getReplace(rating, rate.baseQualityList));

            count = 0;
            for (var item in rating.rate) {
                rating.sum += rating.rate[item];
                count++;
            }
            if (count > 0) {
                rating.sum /= count;
            }

            return rating.sum + coefficient;
        },
        init: function () {
            /**
             * @type {{wordsRe: Object, scope: Object, scopeCase: Object}}
             */
            this.baseQualityList = this.readQualityList(this.rating);

        }
    };
    rate.init();
    return rate;
});