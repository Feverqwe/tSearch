var wordRate = function() {
    "use strict";
    var var_cache = {
        quality_regexp: new RegExp("Blu-ray|Blu-Ray|BD-Remux|BDRemux|2160p|2160i|1080p|1080i|BDRip-AVC|BD-Rip|BDRip|CAMRip|" +
            "CamRip-AVC|CamRip|HDTV-Rip|HQRip-AVC|HDTVrip|HDTVRip|DTheater-Rip|720p|LowHDRip|HDTV|HDRip-AVC|HDRip|" +
            "DVD-Rip|DVDRip-AVC|DVDRip|DVD5|2xDVD9|DVD9|DVD-9|DVDScr|DVDScreener|HD-DVD|NoDVD|DVD|SatRip|HQSATRip|" +
            "HQRip|TVRip|WEBRip|WEB-DLRip-AV​C|WebDL-Rip|AVC|WEB-DLRip|WEB-DL|SATRip|DVB|IPTVRip|TeleSynch|" +
            "[Зз]{1}вук с TS|TS|АП|ЛО|ЛД|AVO|MVO|VO|DUB|2xDub|Dub|ДБ|ПМ|ПД|ПО|СТ|[Ss]{1}ubs|SUB|[sS]{1}ub|FLAC|flac|" +
            "ALAC|alac|[lL]{1}oss[lL]{1}ess(?! repack)|\\(PS2\\)|PS3|Xbox|XBOX|Repack|RePack|\\[Native\\]|" +
            "Lossless Repack|Steam-Rip|\\(Lossy Rip\/|{Rip}|[лЛ]{1}ицензия|RELOADED|\\[Rip\\]|\\[RiP\\]|\\{L\\}|" +
            "\\(L\\)|\\[L\\]|[Ss]{1}eason(?=[s|:]?)|[Сс]{1}езон(?=[ы|:]?)|CUE|(?=\.)cue|MP3|128|192|320|\\(P\\)|" +
            "\\[P\\]|PC \\(Windows\\)|Soundtrack|soundtrack|H\\\.?264|mp4|MP4|M4V|FB2|PDF|RTF|EPUB|fb2|DJVU|djvu|" +
            "epub|pdf|rtf|[мМ]{1}ультфильм|iTunes Russia", 'g'),
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
    var cal_rate = function(word, position, string) {
        var rate = var_cache.syntax_rate;
        word = word.toLowerCase();
        //проверяет что это не фрагмент слова (проверка слева и справа)
        if (rate.m.indexOf(word) !== -1 || checkLeftRightSymbol(word, position, string) === false) {
            return '';
        }
        rate.m.push(word);
        if (rate.block.length === 0) {
            if (word === "blu-ray") {
                rate.video += 100;
                rate.block.push("video");
                rate.qbox = "Blu-ray";
            } else
            if (word === "bd-remux" || word === "bdremux") {
                rate.video += 90;
                rate.block.push("video");
                rate.qbox = "Remux";
            } else
            if (word === "bd-rip" || word === "bdrip" || word === "bdrip-avc") {
                rate.video += 80;
                rate.block.push("video");
                rate.qbox = "BDRip";
            } else
            if (word === "camrip" || word === "camrip-avc") {
                rate.video += 10;
                rate.block.push("video");
                rate.qbox = "CAMRip";
            } else
            if (word === "hdtv-rip" || word === "hdtvrip") {
                rate.video += 70;
                rate.block.push("video");
                rate.qbox = "HDTV-Rip";
            } else
            if (word === "dtheater-rip") {
                rate.video += 70;
                rate.block.push("video");
                rate.qbox = "DTheater-Rip";
            } else
            if (word === "lowhdrip") {
                rate.video += 10;
                rate.block.push("video");
                rate.qbox = "LowHDRip";
            } else
            if (word === "hdtv") {
                rate.video += 60;
                rate.block.push("video");
                rate.qbox = "HDTV";
            } else
            if (word === "hdrip" || word === "hdrip-avc") {
                rate.video += 60;
                rate.block.push("video");
                rate.qbox = "HDRip";
            } else
            if (word === "dvdrip" || word === "dvd-rip" || word === "dvdrip-avc") {
                rate.video += 60;
                rate.block.push("video");
                rate.qbox = "DVD-Rip";
            } else
            if (word === "hd-dvd") {
                rate.video += 68;
                rate.block.push("video");
                rate.qbox = "DVD";
            } else
            if (word === "2xdvd9") {
                rate.video += 65;
                rate.block.push("video");
                rate.qbox = "DVD";
            } else
            if (word === "dvd9" || word === "dvd-9") {
                rate.video += 62;
                rate.block.push("video");
                rate.qbox = "DVD";
            } else
            if (word === "dvd" || word === "dvd5") {
                rate.video += 50;
                rate.block.push("video");
                rate.qbox = "DVD";
            } else
            if (word === "hqsatrip" || word === "hqrip" || word === "hqrip-avc") {
                rate.video += 44;
                rate.block.push("video");
                rate.qbox = "HDrip";
            } else
            if (word === "tvrip" || word === "iptvrip") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "TV-Rip";
            } else
            if (word === "webrip") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "WebRip";
            } else
            if (word === "web-dlrip-avc" || word === "webdl-rip" || word === "web-dlrip" || word === "web-dl") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "WEB-DL";
            } else
            if (word === "satrip") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "SAT-Rip";
            } else
            if (word === "dvb") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "DVB";
            } else
            if (word === "telesynch" || word === "ts") {
                rate.video += 20;
                rate.block.push("video");
                rate.qbox = "Telesync";
            }
            if (word === "dvdscr" || word === "dvdscreener") {
                rate.video += 20;
                rate.block.push("video");
                rate.qbox = "DVD-Screener";
            }
            if (word === "flac" || word === "alac" || word === "lossless") {
                rate.music += 100;
                rate.block.push("music");
                rate.qbox = "lossless";
            } else
            if (word === "mp3") {
                rate.music += 80;
                rate.qbox = "MP3";
            } else
            if (word === "ps3") {
                rate.game += 80;
                rate.block.push("game");
                rate.qbox = "PS3";
            } else
            if (word === "xbox") {
                rate.game += 80;
                rate.block.push("game");
                rate.qbox = "XBox";
            } else
            if (word === "(ps2)") {
                rate.game += 80;
                rate.block.push("game");
                rate.qbox = "PS2";
            } else
            if (word === "[p]" || word === "{p}" || word === "(p)") {
                rate.game += 20;
                rate.block.push("game");
                rate.qbox = "P";
            } else
            if (word === "repack" || word === "lossless repack" || word === "steam-rip" || word === "(lossy rip)" || word === "reloaded") {
                rate.game += 60;
                rate.block.push("game");
                rate.qbox = "RePack";
            } else
            if (word === "[native]") {
                rate.game += 100;
                rate.block.push("game");
                rate.qbox = "Native";
            } else
            if (word === "[rip]" || word === "{rip}" || word === "(rip)") {
                rate.game += 80;
                rate.block.push("game");
                rate.qbox = "Rip";
            } else
            if (word === "[l]" || word === "{l}" || word === "(l)") {
                rate.game += 100;
                rate.block.push("game");
                rate.qbox = "L";
            } else
            if (word === "лицензия") {
                rate.game += 100;
                rate.block.push("game");
                rate.qbox = "L";
            } else
            if (word === "fb2" || word === "pdf" || word === "dejvu" || word === "rtf" || word === "epub") {
                rate.book += 100;
                rate.block.push("book");
                rate.qbox = word;
            }
        }
        if (word === "h.264" || word === "h264" || word === "mp4" || word === "m4v") {
            rate.video += 2;
        } else
        if (word === "2160p" || word === "2160i") {
            rate.video += 20;
        } else
        if (word === "1080p" || word === "1080i") {
            rate.video += 20;
        } else
        if (word === "720p") {
            rate.video += 10;
        } else
        if (word === "звук с ts") {
            rate.video -= 50;
        } else
        if (word === "ст" || word === "sub" || word === "subs") {
            rate.video += 1;
        } else
        if (word === "itunes russia") {
            rate.video += 10;
        } else
        if (word === "dub" || word === "пд" || word === "по" || word === "дб" || word === "2xdub") {
            rate.video += 3;
        } else
        if (word === "пм") {
            rate.video += 2;
        } else
        if (word === "ап" || word === "ло" || word === "лд" || word === "vo") {
            rate.video += 1;
        } else
        if (word === "pc (windows)") {
            rate.game += 5;
        } else
        if (word === "сезон" || word === "season") {
            rate.serial++;
        } else
        if (word === "cue") {
            rate.music += 20;
        } else
        if (word === "soundtrack") {
            rate.music++;
        } else
        if (word === "32" && rate.m.indexOf('mp3') !== -1) {
            rate.music -= 2;
        } else
        if (word === "64" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 0;
        } else
        if (word === "96" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 2;
        } else
        if (word === "128" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 5;
        } else
        if (word === "192" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 10;
        } else
        if (word === "320" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 15;
        } else
        if (word === "мультфильм") {
            rate.mult++;
        }
        return '';
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
        var rate = var_cache.syntax_rate = {name: 0, video: 0, game: 0, music: 0, serial: 0, book: 0, mult: 0, m: [], seed: 0, value: 0, year: 0, block: [], qbox: "+"};
        var name_low = name.toLowerCase();
        name.replace(var_cache.quality_regexp, cal_rate);
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
        var rate = var_cache.catRate = {films: 0, serials: 0, anime: 0, dochumor: 0, music: 0, games: 0, books: 0, cartoons: 0, software: 0, sport: 0, xxx: 0, other: 0, m: []};
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
        if (quality.book) {
            return 5;
        } else
        if (quality.serial) {
            return 0;
        } else
        if (quality.mult) {
            return 4;
        } else
        if (quality.video > quality.music && quality.video > quality.game) {
            return 3;
        } else
        if (quality.music > quality.video && quality.music > quality.game) {
            return 1;
        } else
        if (quality.game > quality.music && quality.game > quality.video) {
            return 2;
        }
        return -1;
    };
    return {
        syntaxCacheRequest: syntaxCacheRequest,
        titleHighLight: titleHighLight,
        autosetCategory: autosetCategory
    }
}();