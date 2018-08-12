import escapeRegExp from 'lodash.escaperegexp';
import isEmptyObject from "./isEmptyObject";
import isPunctuation from "./isPunctuation";
import isBoundary from "./isBoundary";

const bitRate = [
  {
    match: [{regexp: 1, word: '320\\s*(kbps)?', caseSens: 0}],
    rate: {
      audioFormat: 30
    }
  },
  {
    match: [{regexp: 1, word: '256\\s*(kbps)?', caseSens: 0}],
    rate: {
      audioFormat: 25
    }
  },
  {
    match: [{regexp: 1, word: '192\\s*(kbps)?', caseSens: 0}],
    rate: {
      audioFormat: 20
    }
  },
  {
    match: [{regexp: 1, word: '128\\s*(kbps)?', caseSens: 0}],
    rate: {
      audioFormat: 10
    }
  },
  {
    match: [{regexp: 1, word: '96\\s*(kbps)?', caseSens: 0}],
    rate: {
      audioFormat: 0
    }
  },
  {
    match: [{regexp: 1, word: '64\\s*(kbps)?', caseSens: 0}],
    rate: {
      audioFormat: -10
    }
  },
  {
    match: [{regexp: 1, word: '32\\s*(kbps)?', caseSens: 0}],
    rate: {
      audioFormat: -20
    }
  }
];

const rate = {
  rating: [
    {name: 'videoFormat', unic: true, rules: [
        {
          match: ['DCPRip'],
          rate: {
            videoFormat: 100
          },
          label: 'DCPRip'
        },
        {
          match: ['blu-ray cee', {word: 'CEE'}],
          rate: {
            videoFormat: 100
          },
          label: 'Blu-ray CEE'
        },
        {
          match: ['blu-ray'],
          rate: {
            videoFormat: 98
          },
          label: 'Blu-ray'
        },
        {
          match: ['bd-remux', 'bd remux', 'BDRemux'],
          rate: {
            videoFormat: 95
          },
          label: 'BDRemux'
        },
        {
          match: ['BDRip-AVC', 'BD-Rip', 'BDRip'],
          rate: {
            videoFormat: 90
          },
          label: 'BDRip'
        },
        {
          match: ['CAMRip', 'CamRip-AVC'],
          rate: {
            videoFormat: 10
          },
          label: 'CAMRip'
        },
        {
          match: ['HDTV-Rip', 'HDTVRip'],
          rate: {
            videoFormat: 60
          },
          label: 'HDTV-Rip'
        },
        {
          match: ['DTheater-Rip'],
          rate: {
            videoFormat: 60
          },
          label: 'DTheater-Rip'
        },
        {
          match: ['LowHDRip', 'VHSRip'],
          rate: {
            videoFormat: 10
          },
          label: 'LowHDRip'
        },
        {
          match: [{word: 'HDTV'}, 'HDRip', 'HDRip-AVC'],
          rate: {
            videoFormat: 50
          },
          label: 'HDTV'
        },
        {
          match: ['DVDRip', 'DVD-Rip', 'DVDRip-AVC'],
          rate: {
            videoFormat: 50
          },
          label: 'DVD-Rip'
        },
        {
          match: ['HD-DVD'],
          rate: {
            videoFormat: 55
          },
          label: 'HD-DVD'
        },
        {
          match: [{regexp: 1, word: '\\d\\s?[x\\*]\\s?DVD\\-?9', caseSens: 0}],
          rate: {
            videoFormat: 50
          },
          label: 'DVD-9'
        },
        {
          match: [{regexp: 1, word: '\\d\\s?[x\\*]\\s?DVD\\-?5', caseSens: 0}],
          rate: {
            videoFormat: 45
          },
          label: 'DVD-5'
        },
        {
          match: [{word: 'DVD'}],
          rate: {
            videoFormat: 40
          },
          label: 'DVD'
        },
        {
          match: ['HQSATRip', 'HQRip', 'HQRip-AVC'],
          rate: {
            videoFormat: 38
          },
          label: 'HDrip'
        },
        {
          match: ['TVRip', 'IPTVRip'],
          rate: {
            videoFormat: 35
          },
          label: 'TV-Rip'
        },
        {
          match: ['WEBRip'],
          rate: {
            videoFormat: 35
          },
          label: 'WebRip'
        },
        {
          match: ['WEB-DLRip-AVC', 'WebDL-Rip', 'WEB-DLRip', 'WEB-DL'],
          rate: {
            videoFormat: 35
          },
          label: 'WEB-DL'
        },
        {
          match: ['SATRip'],
          rate: {
            videoFormat: 35
          },
          label: 'SAT-Rip'
        },
        {
          match: [{word: 'DVB'}],
          rate: {
            videoFormat: 35
          },
          label: 'DVB'
        },
        {
          match: [{word: 'TS'}, 'TeleSynch'],
          rate: {
            videoFormat: 15
          },
          label: 'TeleSynch'
        },
        {
          match: ['DVDScr', 'DVDScreener'],
          rate: {
            videoFormat: 15
          },
          label: 'DVD-Screener'
        }
      ]},
    {name: 'videoQuality', join: 'videoFormat', rules: [
        {
          match: ['4k', '2k'],
          rate: {
            videoQuality: 100
          }
        },
        {
          match: ['2160p', '2160i'],
          rate: {
            videoQuality: 100
          }
        },
        {
          match: ['1080p', '1080i'],
          rate: {
            videoQuality: 90
          }
        },
        {
          match: ['720p'],
          rate: {
            videoQuality: 50
          }
        },
        {
          match: ['HD'],
          rate: {
            videoQuality: 40
          }
        },
        {
          match: ['SD'],
          rate: {
            videoQuality: 20
          }
        }
      ]},
    {name: 'audioFormat', unic: true, rules: [
        {
          match: ['ALAC'],
          rate: {
            audioFormat: 90
          },
          label: 'ALAC'
        },
        {
          match: ['FLAC'],
          rate: {
            audioFormat: 90
          },
          label: 'FLAC',
          sub: [
            {
              match: ['.cue'],
              rate: {
                audioFormat: 10
              }
            }
          ]
        },
        {
          match: ['APE'],
          rate: {
            audioFormat: 90
          },
          label: 'APE'
        },
        {
          match: ['AAC', 'ААС'],
          rate: {
            audioFormat: 50
          },
          label: 'AAC',
          sub: bitRate
        },
        {
          match: ['MP3', 'MР3'],
          rate: {
            audioFormat: 50
          },
          label: 'MP3',
          sub: bitRate
        }
      ]},
    {name: 'gameQuality', unic: true, rules: [
        {
          match: [{word: 'PS3'}],
          rate: {
            gameQuality: 80
          },
          label: 'PS3'
        },
        {
          match: [{word: 'XBOX'}, 'Xbox360', 'Xbox 360'],
          rate: {
            gameQuality: 80
          },
          label: 'XBOX'
        },
        {
          match: [{word: 'PC'}],
          rate: {
            gameQuality: 80
          },
          label: 'PC'
        },
        {
          match: [{word: 'PS2'}, '(ps2)'],
          rate: {
            gameQuality: 70
          },
          label: 'PS2'
        },
        {
          match: [{word: 'Wii'}],
          rate: {
            gameQuality: 50
          },
          label: 'Wii'
        },
        {
          match: [{word: 'GOG'}],
          rate: {
            gameQuality: 80
          },
          label: 'GOG'
        },
        {
          match: ['Steam', 'SteamRip', 'Steam-Rip'],
          rate: {
            gameQuality: 80
          },
          label: 'SteamRip'
        }
      ]},
    {name: 'soft', unic: true, rules: [
        {
          match: [{word: '[L]'}, {word: '{L}'}, {word: '(L)'}, 'License', 'Лицензия'],
          rate: {
            soft: 80
          }
        },
        {
          match: ['[Native]'],
          rate: {
            soft: 80
          }
        },
        {
          match: ['repack'],
          rate: {
            soft: 50
          }
        }
      ]},
    {name: 'book', unic: true, rules: [
        {
          match: ['fb2', 'djvu', 'epub'],
          rate: {
            book: 70
          }
        },
        {
          match: ['pdf', 'rtf', 'doc', 'DОС', 'docx'],
          rate: {
            book: 50
          }
        }
      ]}
  ],
  qualityList: {},
  /**
   *
   * @param [qualityList] Array
   * @returns {{}|{wordsRe: object, scope: object, scopeCase: object}}
   */
  readQualityList: function(qualityList) {
    let wordsRe = null;
    const words = [];
    const wordsReTest = [];
    const scope = {};
    const scopeCase = {};
    const sections = {
      each: {},
      some: {}
    };
    qualityList.forEach(function (section) {
      if (section.parent) {
        sections[section.parent].push(section.name);
      } else
      if (section.join) {
        sections[section.join].push(section.name);
      } else
      if (section.unic) {
        sections[section.name] = sections.some[section.name] = [section.name];
      } else {
        sections[section.name] = sections.each[section.name] = [section.name];
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
                console.error('Word conflict!', wordObj);
              }
            } else {
              if (!scopeCase[wordObj.word]) {
                scopeCase[wordObj.word] = qualityObj;
              } else {
                console.error('Word case conflict!', wordObj);
              }
            }
            words.push(escapeRegExp(wordObj.word));
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

    const scopeRegexpIndex = [];
    const scopeRegexp = [];
    if (wordsReTest.length) {
      wordsReTest.sort(function(a, b) {
        return String(a.re).length > String(b.re).length ? -1 : 1
      });
      wordsReTest.forEach(function (item) {
        scopeRegexp.push(item.re);
        scopeRegexpIndex.push(item.qualityObj);
      });
    }

    Object.keys(sections).forEach(function (key) {
      if (key !== 'each' && key !== 'some') {
        delete sections[key];
      }
    });

    const result = {};
    result.wordsRe = wordsRe;
    result.scope = !isEmptyObject(scope) && scope;
    result.scopeCase = !isEmptyObject(scopeCase) && scopeCase;
    result.scopeRegexp = scopeRegexp.length && scopeRegexp;
    result.scopeRegexpIndex = scopeRegexpIndex;
    result.sections = sections;

    return result;
  },
  baseQualityList: {},
  getScheme: function (query) {
    const scheme = {};

    scheme.query = query;

    scheme.words = [];
    query.split(/[-\s]+/).forEach(function (word) {
      while (word.length && isPunctuation(word[0])) {
        word = word.substr(1);
      }
      while (word.length && isPunctuation(word.slice(-1))) {
        word = word.slice(0, -1);
      }
      if (word.length) {
        scheme.words.push(word);
      }
    });

    scheme.wordsCase = scheme.words.map(function (word) {
      const firstChar = word[0];
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
      return escapeRegExp(word);
    });
    scheme.wordsRe = new RegExp(scheme.wordsRe.join('|'), 'ig');

    scheme.wordsSpaces = new Array(scheme.wordsLow.length);

    const words = scheme.words.slice(0);
    let lastWordEndPos = null;
    query.replace(scheme.wordsRe, function (word, pos, str) {
      const wordLen = word.length;
      if (!word || !isBoundary(str[pos - 1], str[pos + wordLen])) {
        return '';
      }

      const index = words.indexOf(word);
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
    const sectionRules = {};

    torrentTitle.replace(qualityList.wordsRe, function () {
      let word = arguments[0];
      const wordLen = word.length;

      const argLen = arguments.length;
      const pos = arguments[argLen - 2];
      const str = arguments[argLen - 1];

      if (!word || !isBoundary(str[pos - 1], str[pos + wordLen])) {
        return '';
      }

      let qualityObj = qualityList.scopeCase && qualityList.scopeCase[word];

      if (!qualityObj && qualityList.scope) {
        const wordLowCase = word.toLowerCase();
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

      const section = qualityObj.section;
      const sectionName = section.name;

      let currentRule = sectionRules[sectionName];

      if (!currentRule) {
        currentRule = sectionRules[sectionName] = {index: null, rate: {}};
      }

      if (currentRule.index === null || qualityObj.index < currentRule.index) {
        currentRule.index = qualityObj.index;
        currentRule.parent = section.parent;
        currentRule.label = '';

        for (let rName in qualityObj.rate) {
          if (!parentRule) {
            currentRule.rate[rName] = qualityObj.rate[rName];
          } else {
            currentRule.rate[rName] += qualityObj.rate[rName];
          }
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
      const sections = qualityList.sections;
      const labels = [];
      for (let type in sections) {
        for (let key in sections[type]) {
          const item = sections[type][key];
          const rateSum = {};
          let hasSection = false;
          const len = item.length;
          for (let i = 0; i < len; i++) {
            let sectionObj = sectionRules[item[i]];
            if (sectionObj && sectionObj.parent && !sectionRules[sectionObj.parent]) {
              sectionObj = null;
            }
            if (sectionObj) {
              hasSection = true;
              for (let rName in sectionObj.rate) {
                if (!rateSum[rName]) {
                  rateSum[rName] = 0;
                }
                rateSum[rName] += sectionObj.rate[rName];
              }
              if (sectionObj.label) {
                labels.push(sectionObj.label);
              }
            }
          }
          if (hasSection) {
            for (let rName in rateSum) {
              rateSum[rName] /= len;
              rating.rate[rName] = rateSum[rName];
            }
            rating.quality = labels.join(';');
            if (type === 'some') {
              break;
            }
          }
        }
      }
    }
  },
  getTitleReplace: function (rating, scheme) {
    const words = scheme.words;
    const wordsLen = words.length;
    const wordsCase = scheme.wordsCase;
    const wordsLow = scheme.wordsLow.slice(0);
    const wordRate = 100 / wordsLen;
    const wordsSpaces = scheme.wordsSpaces;
    rating.rate.title = 0;
    rating.rate.wordSpaces = 0;
    rating.rate.wordOrder = 0;
    rating.rate.caseSens = 0;
    let lastWordEndPos = null;
    let wordIndex = 0;
    return function (word, pos, str) {
      const wordLen = word.length;
      if (!word || !isBoundary(str[pos - 1], str[pos + wordLen])) {
        return '';
      }

      const wordLow = word.toLowerCase();

      const index = wordsLow.indexOf(wordLow);
      if (index !== -1) {
        wordsLow.splice(index, 1, null);

        const isYear = scheme.years.indexOf(wordLow) !== -1;

        rating.rate.title += wordRate;

        if (!isYear) {
          if (lastWordEndPos === null) {
            lastWordEndPos = pos - 1;
          }

          let spaceSize = pos - lastWordEndPos;
          const spaceCount = wordsSpaces[index];
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

        const queryWord = wordsCase[index];
        if (queryWord) {
          if (queryWord === word[0]) {
            rating.rate.caseSens += wordRate;
          }
        } else {
          rating.rate.caseSens += wordRate;
        }

        wordIndex++;
      }
    };
  },
  getRate: function (torrent, scheme) {
    const rating = {
      quality: '',
      rate: {
        title: 0,
        wordSpaces: 0,
        wordOrder: 0,
        caseSens: 0,
        videoFormat: 0,
        videoQuality: 0,
        audioFormat: 0,
        gameQuality: 0,
        soft: 0,
        book: 0
      },
      sum: 0
    };

    const torrentTitle = torrent.title;

    if (scheme.query) {
      const pos = torrent.title.indexOf(scheme.query);
      if (pos !== -1 && isBoundary(torrentTitle[pos - 1], torrentTitle[pos + scheme.query.length])) {
        rating.rate.title = 100;
        rating.rate.wordSpaces = 100;
        rating.rate.wordOrder = 100;
        rating.rate.caseSens = 100;
      } else {
        torrentTitle.replace(scheme.wordsRe, rate.getTitleReplace(rating, scheme));
      }
    }

    rate.getQualityRating(torrentTitle, rating, rate.baseQualityList);

    for (let key in rating.rate) {
      rating.sum += rating.rate[key];
    }

    return rating;
  },
  init: function () {
    /**
     * @type {{wordsRe: Object, scope: Object, scopeCase: Object}}
     */
    this.baseQualityList = this.readQualityList(JSON.parse(JSON.stringify(this.rating)));
  }
};

rate.init();

export default rate;