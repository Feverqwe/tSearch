/**
 * Created by Anton on 02.04.2015.
 */
var rate = {
    template: {
        bitrate: [
            {
                list: ['32'],
                rate: {music: -2}
            },
            {
                list: ['64'],
                rate: {music: 0}
            },
            {
                list: ['96'],
                rate: {music: 2}
            },
            {
                list: ['128'],
                rate: {music: 5}
            },
            {
                list: ['192'],
                rate: {music: 10}
            },
            {
                list: ['320'],
                rate: {music: 15}
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
            list: (function(){
                var list = [];
                for (var i = 2; i < 10; i++) {
                    list.push(i+'xDVD9');
                    list.push(i+'xDVD-9');
                    list.push(i+' x DVD-9');
                    list.push(i+' x DVD9');
                }
                return list;
            })(),
            rate: {
                video: 65
            },
            name: 'DVD-9'
        },
        {
            list: ['DVD9', 'DVD-9', '1xDVD9', '1xDVD-9'],
            rate: {
                video: 62
            },
            name: 'DVD-9'
        },
        {
            list: (function(){
                var list = [];
                for (var i = 2; i < 10; i++) {
                    list.push(i+'xDVD5');
                    list.push(i+'xDVD-5');
                    list.push(i+' x DVD-5');
                    list.push(i+' x DVD5');
                }
                return list;
            })(),
            rate: {
                video: 53
            },
            name: 'DVD-5'
        },
        {
            list: ['DVD5', 'DVD-5', '1xDVD5', '1xDVD-5'],
            rate: {
                video: 50
            },
            name: 'DVD'
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
                music: 100
            },
            name: 'lossless',
            subAfter: [
                {
                    list: ['repack'],
                    rate: {
                        music: -100
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
                music: 85
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
            list: [{word: '[L]'}, {word: '{L}'}, {word: '(L)'}, 'лицензия'],
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
    regexpList: {
        text2safeR: /([{})(\][\\\.^$\|\?\+])/g
    },
    /**
     *
     * @param [qualityList] Array
     * @param [type] String
     * @returns {{}|{wordsR: object, scope: object, scopeCase: object}}
     */
    readQualityList: function(qualityList, type) {
        "use strict";
        type = type || '';
        qualityList = qualityList || this.defaultQualityList;
        var wordsR = [];
        var scope = {};
        var scopeCase = {};
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
                    if (wordItem.regexp === 1) {
                        wordsR.push(wordItem.word);
                    } else {
                        wordsR.push(wordItem.word.replace(rate.regexpList.text2safeR, "\\$1"));
                    }
                });
            }
            var subList = [];
            if (qualityObj.sub !== undefined) {
                if (typeof qualityObj.sub === 'string') {
                    qualityObj.sub = rate.template[qualityObj.sub];
                }
                mono.expand(qualityObj, rate.readQualityList(qualityObj.sub, 'sub'));
                subList.push('sub');
            }
            if (qualityObj.subAfter !== undefined) {
                if (typeof qualityObj.subAfter === 'string') {
                    qualityObj.subAfter = rate.template[qualityObj.subAfter];
                }
                mono.expand(qualityObj, rate.readQualityList(qualityObj.subAfter, 'subAfter'));
                subList.push('subAfter');
            }
            if (qualityObj.subBefore !== undefined) {
                if (typeof qualityObj.subBefore === 'string') {
                    qualityObj.subBefore = rate.template[qualityObj.subBefore];
                }
                mono.expand(qualityObj, rate.readQualityList(qualityObj.subBefore, 'subBefore'));
                subList.push('subBefore');
            }
            if (subList.length !== 0) {
                qualityObj.subList = subList;
            }
        });
        if (wordsR.length > 0) {
            wordsR = new RegExp(wordsR.join('|'), 'ig');
        } else {
            wordsR = undefined;
        }
        var rObj = {};
        wordsR && (rObj['wordsR'+type] = wordsR);
        !mono.isEmptyObject(scope) && (rObj['scope'+type] = scope);
        !mono.isEmptyObject(scopeCase) && (rObj['scopeCase'+type] = scopeCase);
        return rObj;
    },
    baseQualityList: {},
    charIsSymbol: function(char) {
        if (char === undefined) return 1;
        var code = char.charCodeAt(0);
        if (code > 31 && code < 48) {
            return 1;
        }
        if (code > 126 || code < 31) {
            return 0;
        }
        if (code > 57 && code < 65) {
            return 1;
        }
        if (code > 90 && code < 97) {
            return 1;
        }
        if (code > 122 && code < 127) {
            return 1;
        }
        if ([171, 174, 169, 187, 8222, 8221, 8220].indexOf(code) !== -1) {
            return 1;
        }
        return 0;
    },
    checkLeftRightSymbol: function(word, wordLen, pos, string) {
        return (this.charIsSymbol(string[pos - 1]) !== 0 && this.charIsSymbol(string[pos + wordLen]) !== 0) ? 1 : 0;
    },
    onRateRegexp: function () {
        var argLen = arguments.length;
        var word = arguments[0];
        var pos = arguments[argLen - 2];
        var text = arguments[argLen - 1];
        var wordLen = word.length;
        if (wordLen === 0 || rate.checkLeftRightSymbol(word, wordLen, pos, text) === 0) {
            return '';
        }
        var qualityObj;
        if (this.qualityList.scopeCase === undefined || (qualityObj = this.qualityList.scopeCase[word]) === undefined) {
            word = word.toLowerCase();
            if (this.qualityList.scope === undefined) {
                return '';
            }
            qualityObj = this.qualityList.scope[word];
        }
        if (qualityObj === undefined) {
            return '';
        }
        if (this.matchedList[word] !== undefined) {
            return '';
        }
        this.matchedList[word] = 1;

        if (this.rating.quality === undefined && qualityObj.name !== undefined) {
            this.rating.quality = qualityObj.name;
        }

        for (var key in qualityObj.rate) {
            this.rating.rate[key] += qualityObj.rate[key];
        }

        var onSubRateRegexp, subText;
        if (qualityObj.subList !== undefined) {
            for (var m = 0, type; type = qualityObj.subList[m]; m++) {
                if (type === 'subAfter') {
                    subText = text.substr(pos + wordLen);
                } else
                if (type === 'subBefore') {
                    subText = text.substr(0, pos);
                } else {
                    subText = text;
                }
                if (subText.length !== 0) {
                    onSubRateRegexp = rate.onRateRegexp.bind({
                        rating: this.rating,
                        qualityList: {
                            scope: qualityObj['scope'+type],
                            scopeCase: qualityObj['scopeCase'+type]
                        },
                        matchedList: this.matchedList
                    });
                    subText.replace(qualityObj['wordsR' + type], onSubRateRegexp);
                }
            }
        }
    },
    onBaseTitleRegexp: function (word, pos, text) {
        if (this.requestObj.hlWordLowList.length <= this.index) {
            return '';
        }
        var wordLen = word.length;
        if (wordLen === 0 || rate.checkLeftRightSymbol(word, wordLen, pos, text) === 0) {
            return '';
        }

        var wordLow = word.toLowerCase();

        var caseIndex = this.requestObj.hlWordList.indexOf(word);
        var firstWordBonus = 1.15;
        var nextWordBonus = 1.10;
        var caseBonus = 0;
        if (caseIndex !== -1) {
            firstWordBonus += 0.05;
            nextWordBonus += 0.05;
            caseBonus = 1.05;
        }

        if (this.outList === 0 && (caseIndex === this.index || wordLow === this.requestObj.hlWordLowList[this.index])) {
            this.rate.title += this.requestObj.hlWordRate * caseBonus;
            if (this.index === 0) {
                if (pos === 0) {
                    this.rate.title *= firstWordBonus;
                }
            } else
            if (pos - this.lastPos < 3) {
                this.rate.title += this.requestObj.hlWordSpaceBonus * nextWordBonus
            }
        } else {
            this.outList = 1;
            if (this.fWordList[wordLow] !== undefined) {
                return '';
            }
            if (caseIndex !== -1) {
                this.rate.title += this.requestObj.hlWordRate * caseBonus;
            } else {
                this.rate.title += this.requestObj.hlWordRate;
            }
        }

        this.lastPos = pos + wordLen;
        this.fWordList[wordLow] = 1;
        this.index++;
    },
    onDescTitleRegexp: function (word, pos, text) {
        var wordLen = word.length;
        if (wordLen === 0 || rate.checkLeftRightSymbol(word, wordLen, pos, text) === 0) {
            return '';
        }

        var wordLow = word.toLowerCase();
        if (this.fWordList[wordLow] !== undefined) {
            return '';
        }
        this.fWordList[wordLow] = 1;

        var caseBonus = this.requestObj.hlWordList.indexOf(word) === -1 ? 0 : 1.05;
        if (caseBonus !== 0) {
            this.rate.title += this.requestObj.hlWordRate * caseBonus;
        } else {
            this.rate.title += this.requestObj.hlWordRate;
        }
    },
    onTitleYearRegexp: function (word, pos, text) {
        if (this.requestObj.year.length <= this.index) {
            return '';
        }
        var wordLen = word.length;
        if (wordLen === 0 || rate.checkLeftRightSymbol(word, wordLen, pos, text) === 0) {
            return '';
        }
        this.rate.title += this.requestObj.hlWordRate;
        this.index++;
    },
    sizeSeedRate: function(rating, torrentObj) {
        var rate = rating.rate;
        rate.seed = 0;
        if (engine.settings.calcSeedCount === 1) {
            rate.seed = (torrentObj.seed > 0) ? 50 : 0;
        }
        if (torrentObj.size < 524288000 && rate.video > 45) {
            rate.video = rate.video / 10;
        } else
        if (torrentObj.size < 1363148800 && rate.video > 65) {
            rate.video = rate.video / 2;
        }
    },
    rateText: function (requestObj, titleObj, torrentObj) {
        var rating = {
            quality: undefined,

            rate: {
                video: 0,
                music: 0,
                games: 0,
                books: 0,
                serials: 0,
                cartoons: 0,
                xxx: 0,

                title: 0
            },
            sum: 0
        };
        var onRateRegexp = this.onRateRegexp.bind({
            rating: rating,
            qualityList: this.baseQualityList,
            matchedList: {}
        });
        torrentObj.title.replace(this.baseQualityList.wordsR, onRateRegexp);

        rate.sizeSeedRate(rating, torrentObj);

        if (rating.quality === undefined) {
            rating.quality = '+';
        }

        if (requestObj.hlWordNoYearR !== undefined) {
            var fWordList = {};
            var onBaseTitleRegexp = rate.onBaseTitleRegexp.bind({
                rate: rating.rate,
                requestObj: requestObj,
                index: 0,
                lastPos: 0,
                fWordList: fWordList,
                outList: 0
            });
            titleObj.base.replace(requestObj.hlWordNoYearR, onBaseTitleRegexp);
            var onDescTitleRegexp = rate.onDescTitleRegexp.bind({
                rate: rating.rate,
                requestObj: requestObj,
                index: 0,
                lastPos: 0,
                fWordList: fWordList
            });
            titleObj.desc.toLowerCase().replace(requestObj.hlWordNoYearR, onDescTitleRegexp);
        }

        if (requestObj.yearR !== undefined) {
            var onTitleYearRegexp = rate.onTitleYearRegexp.bind({
                rate: rating.rate,
                requestObj: requestObj,
                index: 0
            });
            torrentObj.title.replace(requestObj.yearR, onTitleYearRegexp);
        }

        for (var item in rating.rate) {
            rating.sum += rating.rate[item];
        }

        return rating
    },
    onHlRequestRegexp: function(word, pos, text) {
        "use strict";
        var wordLen = word.length;
        if (rate.checkLeftRightSymbol(word, wordLen, pos, text) === 0) {
            return word;
        }

        return '{b}'+word+'{/b}';
    },
    hlRequest: function (code, requestObj) {
        if (requestObj.hlWordR === undefined) {
            return code;
        }
        return code.replace(requestObj.hlWordR, this.onHlRequestRegexp);
    },
    init: function () {
        /**
         * @type {{wordsR: Object, scope: Object, scopeCase: Object}}
         */
        this.baseQualityList = this.readQualityList();
        this.charIsSymbol.stat = [0,0,0,0,0,0,0,0];
    }
};