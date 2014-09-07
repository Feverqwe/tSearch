var wordRate = function() {
    "use strict";
    var qBirtate = [
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
    ];
    var def_qualityList = [
        /*
         {
             list: [],
             listCase: [],
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
         }
         */
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
            list: ['HDRip', 'HDRip-AVC'],
            listCase: ['HDTV'],
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
            name: 'DVD'
        },
        {
            list: ['2xDVD9'],
            rate: {
                video: 65
            },
            name: 'DVD'
        },
        {
            list: ['DVD9', 'DVD-9'],
            rate: {
                video: 62
            },
            name: 'DVD'
        },
        {
            list: ['DVD5'],
            listCase: ['DVD'],
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
            listCase: ['DVB'],
            rate: {
                video: 40
            },
            name: 'DVB'
        },
        {
            list: ['TeleSynch'],
            listCase: ['TS'],
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
            subAfter: qBirtate
        },
        {
            list: ['AAC'],
            rate: {
                music: 85
            },
            name: 'AAC',
            subAfter: qBirtate
        },
        {
            listCase: ['PS3'],
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
            list: ['(ps2)'],
            listCase: ['PS2'],
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
            list: ['repack', 'lossless repack', 'steam-rip', '(lossy rip)', 'reloaded'],
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
            listCase: ['[L]', '{L}', '(L)'],
            list: ['лицензия'],
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
            listCase: ['СТ'],
            list: ['sub', 'subs'],
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
            listCase: ['DUB', 'Dub', 'ДБ', 'ПО', 'ПД'],
            list: ['2xDub'],
            rate: {
                video: 3
            }
        },
        {
            listCase: ['ПМ'],
            rate: {
                video: 2
            }
        },
        {
            listCase: ['АП', 'ЛО', 'ЛД', 'VO'],
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
            list: ['.cue'],
            listCase: ['CUE'],
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
        }
    ];
    var qualityList = def_qualityList.slice(0);

    var var_cache = {
        subList: [],

        cat_regexp: new RegExp("фильмы без сюжета|документальные|мультим|мульт|сериа|комикс|видео для [моб|смарт|" +
            "устр]{1}|мобильное|аудиокниги|беллетр|книг|фильм|игр|3gp|soundtrack|саундтрек|anim|аним|докумел|литер|" +
            "телеп|эрот|xxx|porn|порно|сайтр|тв[\-]{1}|тв$|музыка|hentai|хентай|psp|xbox|журнал|софт|soft|спорт|юмор|" +
            "утилит|book|game|tv |tv$|manga", "g"),
        year: (new Date()).getFullYear(),
        getYear: new RegExp('[1-2]{1}[0-9]{3}'),
        rm_spaces: new RegExp('\\s+','g'),
        text2safe_regexp_text: new RegExp('([{})(\\][\\\\\\.^$\\|\\?\\+])','g'),
        rm_pre_tag_regexp: new RegExp("\\(.*\\)|\\[.*\\]", 'g'),
        searchTextAngle: new RegExp('\\&lt;(/?)b\\&gt;','gm'),
        searchAngleL: new RegExp('<','gm'),
        searchAngleR: new RegExp('>','gm'),
        found_parenthetical: new RegExp('(\\[[^\\]]*\\]|\\([^\\)]*\\)|\\{[^\\}]*\\})','g'),
        rm_retry: new RegExp('<\\/span>(.?)<span class="sub_name">|<\\/b>(.?)<b>', 'g'),
        syntaxCache: {}
    };

    var initWordCache = function(_words) {
        var words = [];
        var wordsCase = [];
        var wordObj = {};
        _words.forEach(function(item) {
            if (item.list !== undefined) {
                item.list.forEach(function(word) {
                    word = word.toLocaleLowerCase();
                    if (wordObj[word] !== undefined) {
                        console.log('Word conflict!', word);
                    }
                    wordObj[word] = item;
                    words.push(word.replace(var_cache.text2safe_regexp_text, "\\$1"));
                });
            }
            if (item.listCase !== undefined) {
                item.listCase.forEach(function(word) {
                    if (wordObj[word] !== undefined) {
                        console.log('Word conflict!', word);
                    }
                    wordObj[word] = item;
                    wordsCase.push(word.replace(var_cache.text2safe_regexp_text, "\\$1"));
                });
            }
            var list;
            if (item.sub !== undefined) {
                var_cache.subList.indexOf('sub') === -1 && var_cache.subList.push('sub');
                list = initWordCache(item.sub);
                item.words_sub = list[0];
                item.wordsCase_sub = list[1];
                item.wordObj_sub = list[2];
            }
            if (item.subAfter !== undefined) {
                var_cache.subList.indexOf('subAfter') === -1 && var_cache.subList.push('subAfter');
                list = initWordCache(item.subAfter);
                item.words_subAfter = list[0];
                item.wordsCase_subAfter = list[1];
                item.wordObj_subAfter = list[2];
            }
            if (item.subBefore !== undefined) {
                var_cache.subList.indexOf('subBefore') === -1 && var_cache.subList.push('subBefore');
                list = initWordCache(item.subBefore);
                item.words_subBefore = list[0];
                item.wordsCase_subBefore = list[1];
                item.wordObj_subBefore = list[2];
            }
        });
        if (words.length > 0) {
            words = new RegExp(words.join('|'), 'g');
        } else {
            words = undefined;
        }
        if (wordsCase.length > 0) {
            wordsCase = new RegExp(wordsCase.join('|'), 'g');
        } else {
            wordsCase = undefined;
        }
        return [words, wordsCase, wordObj];
    };
    var updateCache = function() {
        var list = initWordCache(qualityList);
        var_cache.words = list[0];
        var_cache.wordsCase = list[1];
        var_cache.wordObj = list[2];
    };

    var syntaxCacheRequest = function(request, _syntaxCache) {
        var year = request.match(var_cache.getYear);
        if (year !== null) {
            year = Math.max.apply(Math, year);
            if (year > var_cache.year + 5) {
                year = null;
            }
            if (year < 1900) {
                year = null;
            }
        }
        delete _syntaxCache.year;
        var_cache.syntaxCache = {};
        var_cache.syntaxCache.normalize_request = $.trim(request).replace(var_cache.rm_spaces, " ");
        var_cache.syntaxCache.normalize_request_len = var_cache.syntaxCache.normalize_request.length;
        var safe_regexp = var_cache.syntaxCache.normalize_request.replace(var_cache.text2safe_regexp_text,"\\$1");
        var_cache.syntaxCache.words = safe_regexp.toLowerCase().split(' ');
        var_cache.syntaxCache.normalize_request_low = var_cache.syntaxCache.normalize_request.toLowerCase();
        var_cache.syntaxCache.normalize_request_low_len = var_cache.syntaxCache.normalize_request_low.length;
        var_cache.syntaxCache.words_len = var_cache.syntaxCache.words.length;
        var_cache.syntaxCache.words_is_regexp = new RegExp(var_cache.syntaxCache.words.join('|'), "ig");
        if (year !== null) {
            var_cache.syntaxCache.year = _syntaxCache.year = year;
            var_cache.syntaxCache.normalize_request_no_year = $.trim(var_cache.syntaxCache.normalize_request.replace(new RegExp('\\s?'+year+'\\s?','g'),' ').replace(var_cache.rm_spaces, " "));
            var_cache.syntaxCache.normalize_request_no_year_len = var_cache.syntaxCache.normalize_request_no_year.length;
            var_cache.syntaxCache.normalize_request_no_year_low = var_cache.syntaxCache.normalize_request_no_year.toLowerCase();
            var_cache.syntaxCache.normalize_request_no_year_low_len = var_cache.syntaxCache.normalize_request_no_year_low.length;
        }
        var_cache.syntaxCache.word_rate = Math.round(200 / var_cache.syntaxCache.words_len);
        var_cache.syntaxCache.first_word_rate = Math.round( var_cache.syntaxCache.word_rate*1.25 );
    };

    var checkForSymbol = function(_char) {
        var code = _char.charCodeAt(0);
        if (isNaN(code)) {
            return 1;
        }
        if (code > 126 || code < 31) {
            return 0;
        }
        if (code > 31 && code < 48) {
            return 1;
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
        if (code === 171 || code === 187) {
            return 1;
        }
        return 0;
    };
    var checkLeftRightSymbol = function(word, pos, string) {
        return (checkForSymbol(string[pos - 1] || '') !== 0 && checkForSymbol(string[pos + word.length] || '') !== 0);
    };

    var angleSelect = function(name) {
        if (name.indexOf('&lt;') === -1 || name.indexOf('&gt;') === -1) {
            return name;
        }
        var angleLeft = undefined;
        var angleRight = undefined;
        for (var i = 35; i < 48; i++) {
            var specChar = String.fromCharCode(i);
            if (name.indexOf( specChar ) === -1) {
                if (angleLeft === undefined) {
                    angleLeft = specChar;
                } else
                if (angleRight === undefined) {
                    angleRight = specChar;
                    break;
                }
            }
        }
        if (angleLeft === undefined || angleRight === undefined) {
            return name;
        }
        name = name.replace(/&lt;/g, angleLeft);
        name = name.replace(/&gt;/g, angleRight);
        var cacheName = 'selectAngleCache_'+angleLeft+'_'+angleRight;
        if (var_cache[cacheName] === undefined) {
            var_cache[cacheName] = new RegExp('(\\' + angleLeft + '[^\\' + angleRight + ']*\\' + angleRight + ')', 'g');
        }
        if (var_cache[cacheName+'Left'] === undefined) {
            var_cache[cacheName+'Left'] = new RegExp('\\' + angleLeft, 'g');
        }
        if (var_cache[cacheName+'Right'] === undefined) {
            var_cache[cacheName+'Right'] = new RegExp('\\' + angleRight, 'g');
        }
        name = name.replace(var_cache[cacheName], '<span class="sub_name">$1</span>');
        name = name.replace(var_cache[cacheName+'Left'], '&lt;');
        name = name.replace(var_cache[cacheName+'Right'], '&gt;');
        return name;
    };
    var sub_select = function(name, hasAngle) {
        //выделяет то, что в скобках
        name = name.replace(var_cache.rm_retry,'$1$2');

        if (hasAngle) {
            name = name.replace(var_cache.searchAngleL, '&lt;');
            name = name.replace(var_cache.searchAngleR, '&gt;');
            name = name.replace(var_cache.searchTextAngle, '<$1b>');
        }

        if (engine.settings.enableHighlight === 0) {
            return name;
        }
        if (hasAngle) {
            name = angleSelect(name);
        }
        name = name.replace(var_cache.found_parenthetical, '<span class="sub_name">$1</span>');
        return name.replace(var_cache.rm_retry,'$1$2');
    };

    var rateWord = function(word, pos) {
        var rate = this.syntaxRate;
        if (checkLeftRightSymbol(word, pos, this.text) === false) {
            return '';
        }
        var item = this.wordObj[word];
        if (item.dbl === undefined) {
            if (rate.m.indexOf(word) !== -1) {
                return '';
            } else {
                rate.m.push(word);
            }
        }

        if (rate.block === 1 && item.name !== undefined) {
            return '';
        }

        if (item.name !== undefined) {
            rate.block = 1;
            rate.qbox = item.name;
        }

        for (var key in item.rate) {
            rate[key] += item.rate[key];
        }

        for (var m = 0, subName; subName = var_cache.subList[m]; m++) {
            if (item['wordObj_'+subName] === undefined) {
                continue;
            }
            var _rateWord = rateWord.bind({
                text: this.text,
                textLower: this.textLower,
                wordObj: item['wordObj_'+subName],
                syntaxRate: rate
            });
            if (item['words_'+subName] !== undefined) {
                var subTextLower = undefined;
                if (subName === 'subAfter') {
                    subTextLower = this.textLower.substr(pos + word.length);
                } else
                if (subName === 'subBefore') {
                    subTextLower = this.textLower.substr(0, pos);
                } else {
                    subTextLower = this.textLower;
                }
                if (subTextLower.length > 0) {
                    subTextLower.replace(item['words_' + subName], _rateWord);
                }
            }
            if (item['wordsCase_'+subName] !== undefined) {
                var subText = undefined;
                if (subName === 'subAfter') {
                    subText = this.text.substr(pos + word.length);
                } else
                if (subName === 'subBefore') {
                    subText = this.text.substr(0, pos);
                } else {
                    subText = this.text;
                }
                if (subText.length > 0) {
                    subText.replace(item['wordsCase_' + subName], _rateWord);
                }
            }
        }
        return '';
    };

    var titleHighLight = function(name) {
        /*
         * Выставляет рейтинг заголовку раздачи
         * Подсвечивает найденный текст в заголовке
         */
        var hasAngle = name.indexOf('<') !== -1 || name.indexOf('>') !== -1;
        var bonus = 0;
        var words_len = var_cache.syntaxCache.words_len;
        var word_rate = var_cache.syntaxCache.word_rate;
        var bonus_value = Math.round(word_rate / 2);
        var first_word_rate = var_cache.syntaxCache.first_word_rate;
        var year = var_cache.syntaxCache.year;
        var rate = {
            name: 0,

            video: 0,
            games: 0,
            music: 0,
            serials: 0,
            books: 0,
            cartoons: 0,
            xxx: 0,

            m: [],
            // block enable primary keys
            block: 0,
            qbox: "+"
        };
        var name_low = name.toLowerCase();
        var _rateWord = rateWord.bind({
            text: name,
            textLower: name_low,
            wordObj: var_cache.wordObj,
            syntaxRate: rate
        });

        if (var_cache.wordsCase !== undefined) {
            name.replace(var_cache.wordsCase, _rateWord);
        }
        if (var_cache.words !== undefined) {
            name_low.replace(var_cache.words, _rateWord);
        }

        if (var_cache.syntaxCache.normalize_request.length === 0) {
            return {
                hl_name: sub_select(name, hasAngle),
                rate: rate
            };
        }
        var exists_year = year !== undefined;
        var has_year = false;
        if (exists_year) {
            var year_pos = name.indexOf(year);
            if (year_pos !== -1) {
                has_year = checkLeftRightSymbol(year, year_pos, name);
            }
        }
        var symbol;
        var has_fullName = -1;
        if (year !== undefined) {
            has_fullName = name.indexOf(var_cache.syntaxCache.normalize_request_no_year);
            if (has_fullName !== -1) {
                if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request_no_year, has_fullName, name) === false) {
                    has_fullName = -1;
                }
            }
            if (has_fullName !== -1) {
                symbol = name[has_fullName+var_cache.syntaxCache.normalize_request_no_year_len+1];
                if ( symbol === '/' || symbol === '(' || symbol === '|') {
                    bonus += bonus_value;
                }
            }
        } else {
            has_fullName = name.indexOf(var_cache.syntaxCache.normalize_request);
            if (has_fullName !== -1) {
                if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request, has_fullName, name) === false) {
                    has_fullName = -1;
                }
            }
            if (has_fullName !== -1) {
                symbol = name[has_fullName+var_cache.syntaxCache.normalize_request_len+1];
                if ( symbol === '/' || symbol === '(' || symbol === '|') {
                    bonus += bonus_value;
                }
            }
        }
        var pre_word;
        if (has_fullName > 0) {
            pre_word = $.trim(name.substr(0, has_fullName).replace(var_cache.rm_pre_tag_regexp, ''));
            if (pre_word.length === 0){
                has_fullName = 0;
            }
        }
        var has_fullLowName = -1;
        if (has_fullName === -1) {
            if (year !== undefined) {
                has_fullLowName = name_low.indexOf(var_cache.syntaxCache.normalize_request_no_year_low);
                if (has_fullLowName !== -1) {
                    if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request_no_year_low, has_fullLowName, name) === false) {
                        has_fullLowName = -1;
                    }
                }
                if (has_fullLowName !== -1) {
                    symbol = name_low[has_fullLowName+var_cache.syntaxCache.normalize_request_no_year_low_len+1];
                    if ( symbol === '/' || symbol === '(' || symbol === '|') {
                        bonus += bonus_value;
                    }
                }
            } else {
                has_fullLowName = name_low.indexOf(var_cache.syntaxCache.normalize_request_low);
                if (has_fullLowName !== -1) {
                    if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request_low, has_fullLowName, name) === false) {
                        has_fullLowName = -1;
                    }
                }
                if (has_fullLowName !== -1) {
                    symbol = name_low[has_fullLowName+var_cache.syntaxCache.normalize_request_low_len+1];
                    if ( symbol === '/' || symbol === '(' || symbol === '|') {
                        bonus += bonus_value;
                    }
                }
            }
            if (has_fullLowName > 0) {
                pre_word = $.trim(name_low.substr(0, has_fullLowName).replace(var_cache.rm_pre_tag_regexp, ''));
                if (pre_word.length === 0){
                    has_fullLowName = 0;
                }
            }
        }
        var rateSet = false;
        if (has_year === true) {
            if (has_fullName === 0 || has_fullLowName === 0) {
                rate.name = (words_len - 1) * word_rate + first_word_rate + bonus;
                rateSet = true;
            } else
            if (has_fullName !== -1 || has_fullLowName !== -1) {
                rate.name = words_len * word_rate + bonus;
                rateSet = true;
            }
        } else {
            if (has_fullName === 0 || has_fullLowName === 0) {
                rate.name = (words_len - 1) * word_rate + first_word_rate - ((exists_year)?word_rate:0) + bonus;
                rateSet = true;
            } else
            if (has_fullName !== -1 || has_fullLowName !== -1) {
                rate.name = words_len * word_rate - ((exists_year)?word_rate:0) + bonus;
                rateSet = true;
            }
        }
        var hl_name;
        if (rateSet) {
            hl_name = name.replace(var_cache.syntaxCache.words_is_regexp, function(word, position, string){
                if (checkLeftRightSymbol(word, position, string) === false) {
                    return word;
                }
                return '<b>'+word+'</b>';
            });
            return {
                hl_name: sub_select(hl_name, hasAngle),
                rate: rate
            };
        }
        var hl_word_count = 0;
        var year_found = 0;
        if (has_year) {
            hl_word_count += 1;
            rate.name += word_rate;
        }
        var cal_word_rate = function(word, position, string) {
            //функ-я подсвечивает слова поиска в заголовке
            //hl_word_count - счетчик подсвеченных слов
            //year_found - если 1 то значит год в названии найден
            if (checkLeftRightSymbol(word, position, string) === false) {
                return word;
            }
            if (hl_word_count < words_len) {
                if (year === word) {
                    year_found = 1;
                    return '<b>' + word + '</b>';
                }
                if (position === 0 && word.toLowerCase() === var_cache.syntaxCache.words[0]) {
                    rate.name += first_word_rate;
                } else {
                    rate.name += word_rate;
                }
            }
            hl_word_count++;
            return '<b>' + word + '</b>';
        };
        hl_name = name.replace(var_cache.syntaxCache.words_is_regexp, cal_word_rate);
        if (has_year && year_found === 0) {
            hl_name = hl_name.replace(new RegExp(year,'g'), cal_word_rate);
        }
        if (year_found === 1 && hl_word_count === 1) {
            rate.name = 0;
        }
        return {
            hl_name: sub_select(hl_name, hasAngle),
            rate: rate
        };
    };

    var cal_cat_rate = function(word, position, string) {
        var rate = var_cache.catRate;
        if (rate.m.indexOf(word) === -1) {
            rate.m.push(word);
        } else {
            return '';
        }
        if (checkForSymbol(string[position - 1] || '') === 0) {
            return '';
        }
        if (word === "эрот" || word === "xxx" || word === "porn" || word === "порно" || word === "фильмы без сюжета" || word === "hentai" || word === "хентай") {
            rate.xxx += 10;
        }
        if (word === "мультим") {
            rate.software += 2;
        }
        if (word === "мульт") {
            rate.cartoons += 2;
        }
        if (word === "сериа") {
            rate.serials += 2;
        }
        if (word === "книг" || word === "аудиокниги" || word === "литер" || word === "беллетр" || word === "журнал" || word === "book") {
            rate.books += 1;
        }
        if (word === "фильм") {
            rate.films += 1;
        }
        if (word === "soundtrack" || word === "музыка" || word === "саундтрек") {
            rate.music += 2;
        }
        if (word === "игр" || word === "psp" || word === "xbox" || word === "game") {
            rate.games += 1;
        }
        if (word === "аним" || word === "anim" || word === "manga") {
            rate.anime += 2;
        }
        if (word === "софт" || word === "soft" || word === "утилит") {
            rate.software += 1;
        }
        if (word === "комикс") {
            rate.other += 1;
        }
        if (word === "документальные") {
            rate.dochumor += 3;
        }
        if (word === "спорт") {
            rate.sport += 1;
        }
        if (word === "докумел" || word === "телеп" || word === "тв " || word === "тв" || word === "тв-" || word === "tv" || word === "tv ") {
            rate.dochumor += 2;
        }
        if (word === "юмор") {
            rate.dochumor += 1;
        }
        if (word === "видео для моб" || word === "видео для смарт" || word === "видео для устр" || word === "Мобильное" || word === "3gp") {
            rate.other += 1;
        }
        return '';
    };
    var autosetCategory = function(quality, category) {
        /*
         * Алгоритм определения категории
         */
        var rate = var_cache.catRate = {
            films: 0,
            serials: 0,
            anime: 0,
            dochumor: 0,
            music: 0,
            games: 0,
            books: 0,
            cartoons: 0,
            software: 0,
            sport: 0,
            xxx: 0,
            other: 0,
            m: []
        };
        category.toLowerCase().replace(var_cache.cat_regexp, cal_cat_rate);
        var qual_cat = [];
        $.each(rate, function(k, v) {
            if (k !== 'm') {
                qual_cat.push([v, k]);
            }
        });
        qual_cat.sort(function(a, b) {
            if (a[0] > b[0]) {
                return -1;
            } else
            if (a[0] === b[0]) {
                return 0;
            } else
                return 1;
        });
        if (qual_cat[0][0] > 0) {
            var pos = ['serials', 'music', 'games', 'films', 'cartoons', 'books', 'software', 'anime', 'dochumor', 'sport', 'xxx', 'other'].indexOf(qual_cat[0][1]);
            if (pos === 11) {
                return -1;
            } else {
                return pos;
            }
        }
        if (quality.xxx) {
            return 10;
        } else
        if (quality.books) {
            return 5;
        } else
        if (quality.serials) {
            return 0;
        } else
        if (quality.cartoons) {
            return 4;
        } else
        if (quality.video > quality.music && quality.video > quality.games) {
            return 3;
        } else
        if (quality.music > quality.video && quality.music > quality.games) {
            return 1;
        } else
        if (quality.games > quality.music && quality.games > quality.video) {
            return 2;
        }
        return -1;
    };
    var sizeSeedRate = function(quality, item) {
        /*
         * Расчет качетсва по сидам
         * Перерасчет соотношения качества видео и размера раздачи
         */

        quality.seed = (item.seeds > 0) ? 50 : 0;
        if (item.size < 524288000 && quality.video > 45) {
            quality.video = Math.round(parseInt(quality.video) / 10);
        } else
        if (item.size < 1363148800 && quality.video > 65) {
            quality.video = Math.round(parseInt(quality.video) / 2);
        }
        quality.value = quality.seed + quality.name + quality.video + quality.music + quality.games + quality.books;
        return quality;
    };
    return {
        syntaxCacheRequest: syntaxCacheRequest,
        titleHighLight: titleHighLight,
        autosetCategory: autosetCategory,
        sizeSeedRate: sizeSeedRate,
        qualityList: qualityList,
        def_qualityList: def_qualityList,
        setTitleQualityList: function(titleQualityList) {
            qualityList.splice(0);
            Array.prototype.push.apply(qualityList, titleQualityList);
        },
        updateCache: updateCache
    }
}();