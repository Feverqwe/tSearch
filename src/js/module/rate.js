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
                    label: 'DCPRip'
                },
                {
                    match: ['blu-ray cee', {word: 'CEE'}],
                    value: 100,
                    label: 'Blu-ray CEE'
                },
                {
                    match: ['blu-ray'],
                    value: 98,
                    label: 'Blu-ray'
                },
                {
                    match: ['bd-remux', 'bd remux', 'BDRemux'],
                    value: 95,
                    label: 'BDRemux'
                },
                {
                    match: ['BDRip-AVC', 'BD-Rip', 'BDRip'],
                    value: 90,
                    label: 'BDRip'
                },
                {
                    match: ['CAMRip', 'CamRip-AVC'],
                    value: 10,
                    label: 'CAMRip'
                },
                {
                    match: ['HDTV-Rip', 'HDTVRip'],
                    value: 60,
                    label: 'HDTV-Rip'
                },
                {
                    match: ['DTheater-Rip'],
                    value: 60,
                    label: 'DTheater-Rip'
                },
                {
                    match: ['LowHDRip', 'VHSRip'],
                    value: 10,
                    label: 'LowHDRip'
                },
                {
                    match: [{word: 'HDTV'}, 'HDRip', 'HDRip-AVC'],
                    value: 50,
                    label: 'HDTV'
                },
                {
                    match: ['DVDRip', 'DVD-Rip', 'DVDRip-AVC'],
                    value: 50,
                    label: 'DVD-Rip'
                },
                {
                    match: ['HD-DVD'],
                    value: 55,
                    label: 'HD-DVD'
                },
                {
                    match: [{regexp: 1, word: '\\d\\s?[x\\*]\\s?DVD\\-?9', caseSens: 0}],
                    value: 50,
                    label: 'DVD-9'
                },
                {
                    match: [{regexp: 1, word: '\\d\\s?[x\\*]\\s?DVD\\-?5', caseSens: 0}],
                    value: 45,
                    label: 'DVD-5'
                },
                {
                    match: [{word: 'DVD'}],
                    value: 40,
                    label: 'DVD'
                },
                {
                    match: ['HQSATRip', 'HQRip', 'HQRip-AVC'],
                    value: 38,
                    label: 'HDrip'
                },
                {
                    match: ['TVRip', 'IPTVRip'],
                    value: 35,
                    label: 'TV-Rip'
                },
                {
                    match: ['WEBRip'],
                    value: 35,
                    label: 'WebRip'
                },
                {
                    match: ['WEB-DLRip-AVC', 'WebDL-Rip', 'WEB-DLRip', 'WEB-DL'],
                    value: 35,
                    label: 'WEB-DL'
                },
                {
                    match: ['SATRip'],
                    value: 35,
                    label: 'SAT-Rip'
                },
                {
                    match: [{word: 'DVB'}],
                    value: 35,
                    label: 'DVB'
                },
                {
                    match: [{word: 'TS'}, 'TeleSynch'],
                    value: 15,
                    label: 'Telesync'
                },
                {
                    match: ['DVDScr', 'DVDScreener'],
                    value: 15,
                    label: 'DVD-Screener'
                }
            ]},
            {name: 'videoQuality', join: 'videoFormat', rules: [
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
            ]},
            {name: 'audioFormat', rules: [
                {
                    match: ['ALAC'],
                    value: 100,
                    label: 'ALAC'
                },
                {
                    match: ['FLAC'],
                    value: 100,
                    label: 'FLAC'
                },
                {
                    match: ['APE'],
                    value: 100,
                    label: 'APE'
                },
                {
                    match: ['AAC'],
                    value: 90,
                    label: 'MP3'
                },
                {
                    match: ['MP3'],
                    value: 50,
                    label: 'MP3',
                    sub: [
                        {
                            match: ['320'],
                            value: 40
                        },
                        {
                            match: ['256'],
                            value: 30
                        },
                        {
                            match: ['192'],
                            value: 20
                        },
                        {
                            match: ['128'],
                            value: 10
                        },
                        {
                            match: ['96'],
                            value: 0
                        },
                        {
                            match: ['64'],
                            value: -10
                        },
                        {
                            match: ['32'],
                            value: -20
                        }
                    ]
                }
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
            var sections = {};
            qualityList.forEach(function (section) {
                if (section.parent) {
                    sections[section.parent].push(section.name);
                } else
                if (section.join) {
                    sections[section.join].push(section.name);
                } else {
                    sections[section.name] = [section.name];
                }
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

                    if (qualityObj.sub) {
                        qualityObj.sub = rate.readQualityList([{
                            name: section.name,
                            rules: qualityObj.sub
                        }]);
                    }
                });
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
            result.sections = sections;

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
        getQualityRating: function (torrentTitle, rating, qualityList, matched, parentRule) {
            matched = matched || [];
            var sectionRules = {};

            torrentTitle.replace(qualityList.wordsRe, function () {
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

                var currentRule = sectionRules[sectionName];

                if (!currentRule) {
                    currentRule = sectionRules[sectionName] = {index: null};
                }

                if (currentRule.index === null || qualityObj.index < currentRule.index) {
                    currentRule.index = qualityObj.index;
                    currentRule.parent = section.parent;
                    currentRule.label = '';

                    if (!parentRule) {
                        currentRule.value = qualityObj.value;
                    } else {
                        parentRule.value += qualityObj.value;
                    }

                    if (!parentRule && qualityObj.label) {
                        currentRule.label = qualityObj.label
                    }

                    if (qualityObj.sub) {
                        rate.getQualityRating(str, rating, qualityObj.sub, matched, parentRule);
                    }
                }

                return '';
            });

            if (!parentRule) {
                var sections = qualityList.sections;
                var labels = [];
                for (var key in sections) {
                    var item = sections[key];
                    var sum = 0;
                    for (var i = 0, len = item.length; i < len; i++) {
                        var sectionObj = sectionRules[item[i]];
                        if (sectionObj && sectionObj.parent && !sectionRules[sectionObj.parent]) {
                            sectionObj = null;
                        }
                        if (sectionObj) {
                            sum += sectionObj.value;
                            if (sectionObj.label) {
                                labels.push(sectionObj.label);
                            }
                        }
                    }
                    sum /= len;
                    rating.rate[key] = sum;
                    rating.quality = labels.join(';');
                }
            }
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
                quality: '',
                rate: {
                    title: 0,
                    wordSpaces: 0,
                    wordOrder: 0,
                    caseSens: 0
                },
                sum: 0
            };

            var torrentTitle = torrent.title;

            if (scheme.query) {
                var pos = torrent.title.indexOf(scheme.query);
                if (pos !== -1 && utils.isBoundary(torrentTitle[pos - 1], torrentTitle[pos + scheme.query.length])) {
                    rating.rate.title = 100;
                    rating.rate.wordSpaces = 100;
                    rating.rate.wordOrder = 100;
                    rating.rate.caseSens = 100;
                } else {
                    torrentTitle.replace(scheme.wordsRe, rate.getTitleReplace(rating, scheme));
                }
            }

            rate.getQualityRating(torrentTitle, rating, rate.baseQualityList);

            for (var key in rating.rate) {
                rating.sum += rating.rate[key];
            }

            return rating.sum;
        },
        init: function () {
            /**
             * @type {{wordsRe: Object, scope: Object, scopeCase: Object}}
             */
            this.baseQualityList = this.readQualityList(JSON.parse(JSON.stringify(this.rating)));
        }
    };
    rate.init();
    return rate;
});