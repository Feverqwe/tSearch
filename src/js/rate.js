/**
 * Created by Anton on 02.04.2015.
 */
var rate = {
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
    regexpList: {
        text2safeR: /[\-\[\]{}()*+?.,\\\^$|#\s]/g
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
        var wordsR = [];
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
                        wordsR.push(wordItem.word);
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
                        wordsR.push(wordItem.word.replace(rate.regexpList.text2safeR, "\\$&"));
                    }
                });
            }
            var subList = [];
            if (qualityObj.sub !== undefined) {
                if (typeof qualityObj.sub === 'string') {
                    qualityObj.sub = rate.template[qualityObj.sub];
                }
                mono.extend(qualityObj, rate.readQualityList(qualityObj.sub, 'sub'));
                subList.push('sub');
            }
            if (qualityObj.subAfter !== undefined) {
                if (typeof qualityObj.subAfter === 'string') {
                    qualityObj.subAfter = rate.template[qualityObj.subAfter];
                }
                mono.extend(qualityObj, rate.readQualityList(qualityObj.subAfter, 'subAfter'));
                subList.push('subAfter');
            }
            if (qualityObj.subBefore !== undefined) {
                if (typeof qualityObj.subBefore === 'string') {
                    qualityObj.subBefore = rate.template[qualityObj.subBefore];
                }
                mono.extend(qualityObj, rate.readQualityList(qualityObj.subBefore, 'subBefore'));
                subList.push('subBefore');
            }
            if (subList.length !== 0) {
                qualityObj.subList = subList;
            }
        });
        if (wordsR.length > 0) {
            wordsR = new RegExp(wordsR.sort(function(a, b) {
                return String(a).length > String(b).length ? -1 : 1
            }).join('|'), 'ig');
        } else {
            wordsR = undefined;
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
        wordsR && (rObj['wordsR'+type] = wordsR);
        !mono.isEmptyObject(scope) && (rObj['scope'+type] = scope);
        !mono.isEmptyObject(scopeCase) && (rObj['scopeCase'+type] = scopeCase);
        if (scopeRegexp) {
            rObj['scopeRegexp'+type] = scopeRegexp;
            rObj['scopeRegexpIndex'+type] = scopeRegexpIndex;
        }
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
        var wordLowCase;
        if (this.qualityList.scopeCase === undefined || (qualityObj = this.qualityList.scopeCase[word]) === undefined) {
            wordLowCase = word.toLowerCase();
            qualityObj = this.qualityList.scope && this.qualityList.scope[wordLowCase] || undefined;
            if (qualityObj !== undefined) {
                word = wordLowCase;
            }
        }
        this.qualityList.scopeRegexp !== undefined && this.qualityList.scopeRegexp.some(function(regexp, index) {
            "use strict";
            if (regexp.test(word)) {
                qualityObj = this.qualityList.scopeRegexpIndex[index];
                return true;
            }
            return false;
        }.bind(this));
        if (qualityObj === undefined) {
            return '';
        }
        if (this.matchedList[word] !== undefined) {
            return '';
        }
        this.matchedList[word] = 1;

        if (qualityObj.name !== undefined) {
            if (this.rating.quality === undefined) {
                this.rating.quality = qualityObj.name;
            } else {
                return;
            }
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
                            scopeCase: qualityObj['scopeCase'+type],
                            scopeRegexp: qualityObj['scopeRegexp'+type],
                            scopeRegexpIndex: qualityObj['scopeRegexpIndex'+type]
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
        var pref = caseIndex === -1 ? '' : 'Case';
        var wordRate = this.requestObj['hlWord' + pref + 'Rate'];
        var unOrderWordRate = this.requestObj['unOrderWord' + pref + 'Rate'];
        var notFirstWordRate = this.requestObj['notFirstWord' + pref + 'Rate'];
        var notSpaceSlitRate = this.requestObj['notSpaceSlit' + pref + 'Rate'];

        if (this.outList === 0 && (caseIndex === this.index || wordLow === this.requestObj.hlWordLowList[this.index])) {
            this.rate.title += wordRate;
            if (this.index === 0) {
                if (pos !== 0) {
                    this.rate.title -= notFirstWordRate;
                }
            } else
            if (pos - this.lastPos > 2) {
                this.rate.title -= notSpaceSlitRate;
            }
        } else {
            this.outList = 1;
            if (this.fWordList[wordLow] !== undefined) {
                return '';
            }
            this.rate.title += unOrderWordRate;
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

        var caseIndex = this.requestObj.hlWordList.indexOf(word);
        var pref = caseIndex === -1 ? '' : 'Case';
        var unOrderWordRate = this.requestObj['unOrderWord' + pref + 'Rate'];

        this.rate.title += unOrderWordRate;
    },
    onTitleYearRegexp: function (word, pos, text) {
        if (this.requestObj.year.length <= this.index) {
            return '';
        }
        var wordLen = word.length;
        if (wordLen === 0 || rate.checkLeftRightSymbol(word, wordLen, pos, text) === 0) {
            return '';
        }
        this.rate.title += this.requestObj.hlWordCaseRate;
        this.index++;
    },
    sizeSeedRate: function(rating, torrentObj) {
        var rate = rating.rate;
        rate.seed = 0;
        if (engine.settings.calcSeedCount) {
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
                audio: 0,
                video: 0,

                other: 0,
                serials: 0,
                music: 0,
                games: 0,
                films: 0,
                cartoons: 0,
                books: 0,
                software: 0,
                anime: 0,
                doc: 0,
                sport: 0,
                xxx: 0,
                humor: 0,

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

        if (requestObj.hlWordList !== undefined && requestObj.hlWordNoYearR !== undefined && rating.rate.title === 0) {
            rating.rate.title -= 400;
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
        if (mono.isEmptyObject(this.qualityList)) {
            this.qualityList = this.defaultQualityList;
        }
        this.baseQualityList = this.readQualityList(this.qualityList);
    }
};
rate.categoryDefineRegexp = new RegExp("фильмы без сюжета|документальные|мультим|мульт|сериа|комикс|видео для [моб|смарт|" +
    "устр]{1}|мобильное|аудиокниги|беллетр|книг|фильм|игр|3gp|soundtrack|саундтрек|anim|аним|докумел|литер|" +
    "телеп|эрот|xxx|porn|порно|сайтр|тв[-]{1}|тв$|музыка|hentai|хентай|psp|xbox|журнал|софт|soft|спорт|юмор|" +
    "утилит|book|game|tv |tv$|manga", "g");
rate.onCategoryDefineRateRegexp = function(word, position, string) {
    if (this.m.indexOf(word) === -1) {
        this.m.push(word);
    } else {
        return '';
    }
    if (rate.charIsSymbol(string[position - 1] || '') === 0) {
        return '';
    }
    if (word === "эрот" || word === "xxx" || word === "porn" || word === "порно" || word === "фильмы без сюжета" || word === "hentai" || word === "хентай") {
        this.xxx += 10;
    }
    if (word === "мультим") {
        this.software += 2;
    }
    if (word === "мульт") {
        this.cartoons += 2;
    }
    if (word === "сериа") {
        this.serials += 2;
    }
    if (word === "книг" || word === "аудиокниги" || word === "литер" || word === "беллетр" || word === "журнал" || word === "book") {
        this.books += 1;
    }
    if (word === "фильм") {
        this.films += 1;
    }
    if (word === "soundtrack" || word === "музыка" || word === "саундтрек") {
        this.music += 2;
    }
    if (word === "игр" || word === "psp" || word === "xbox" || word === "game") {
        this.games += 1;
    }
    if (word === "аним" || word === "anim" || word === "manga") {
        this.anime += 2;
    }
    if (word === "софт" || word === "soft" || word === "утилит") {
        this.software += 1;
    }
    if (word === "комикс") {
        this.other += 1;
    }
    if (word === "документальные") {
        this.doc += 3;
    }
    if (word === "спорт") {
        this.sport += 1;
    }
    if (word === "докумел" || word === "телеп" || word === "тв " || word === "тв" || word === "тв-" || word === "tv" || word === "tv ") {
        this.doc += 2;
    }
    if (word === "юмор") {
        this.humor += 1;
    }
    if (word === "видео для моб" || word === "видео для смарт" || word === "видео для устр" || word === "Мобильное" || word === "3gp") {
        this.other += 1;
    }
    return '';
};
rate.categoryDefine = function(ratingObj, categoryTitle) {
    /*
     * Category define function
     */
    var rate = {
        other: 0,

        serials: 0,
        music: 0,
        games: 0,
        films: 0,
        cartoons: 0,
        books: 0,
        software: 0,
        anime: 0,
        doc: 0,
        sport: 0,
        xxx: 0,
        humor: 0,

        m: []
    };
    if (categoryTitle) {
        categoryTitle.replace(this.categoryDefineRegexp, this.onCategoryDefineRateRegexp.bind(rate));
        var qCat = [];
        var index = -1;
        $.each(rate, function (k, v) {
            if (k !== 'm') {
                qCat.push([v, index]);
                index++;
            }
        });
        qCat.sort(function (a, b) {
            if (a[0] > b[0]) {
                return -1;
            } else if (a[0] === b[0]) {
                return 0;
            } else
                return 1;
        });
        if (qCat[0][0] > 0) {
            return qCat[0][1];
        }
    }
    var titleRate = ratingObj.rate;
    if (titleRate.xxx) {
        return 10;
    } else
    if (titleRate.books) {
        return 5;
    } else
    if (titleRate.serials) {
        return 0;
    } else
    if (titleRate.cartoons) {
        return 4;
    } else
    if (titleRate.video > titleRate.music && titleRate.video > titleRate.games) {
        return 3;
    } else
    if (titleRate.music > titleRate.video && titleRate.music > titleRate.games) {
        return 1;
    } else
    if (titleRate.games > titleRate.music && titleRate.games > titleRate.video) {
        return 2;
    }
    return -1;
};