import escapeRegExp from 'lodash.escaperegexp';
import sortByLength from "../tools/sortByLength";
import uniq from 'lodash.uniq';
import {types} from "mobx-state-tree";
import getLogger from "../tools/getLogger";

const debug = getLogger('searchFrag');

/**
 * @typedef {{}} FilterM
 * Model:
 * @property {string} text
 * @property {number} minSize
 * @property {number} maxSize
 * @property {number} minSeed
 * @property {number} maxSeed
 * @property {number} minPeer
 * @property {number} maxPeer
 * @property {number} minTime
 * @property {number} maxTime
 * Actions:
 * @property {function(string)} setText
 * @property {function(number, number)} setSize
 * @property {function(number, number)} setSeed
 * @property {function(number, number)} setPeer
 * @property {function(number, number)} setTime
 * Views:
 * @property {function:TextFilter} getTextFilterRe
 * @property {function(string):boolean} testText
 * @property {function(number, number, number):boolean} testRange
 * @property {function(TrackerResultM[]):TrackerResultM[]} processResults
 */

/**
 * @typedef {{}}  TextFilter
 * @property {RegExp} [excludeRe]
 * @property {RegExp} [includeRe]
 * @property {number} includeCount
 */

const filterModel = types.model('filterModel', {
  text: types.optional(types.string, ''),
  minSize: types.optional(types.number, 0),
  maxSize: types.optional(types.number, 0),
  minSeed: types.optional(types.number, 0),
  maxSeed: types.optional(types.number, 0),
  minPeer: types.optional(types.number, 0),
  maxPeer: types.optional(types.number, 0),
  minTime: types.optional(types.number, 0),
  maxTime: types.optional(types.number, 0),
}).actions(/**FilterM*/self => {
  return {
    setText(value) {
      self.text = value;
    },
    setSize(min, max) {
      self.minSize = min;
      self.maxSize = max;
    },
    setSeed(min, max) {
      self.minSeed = min;
      self.maxSeed = max;
    },
    setPeer(min, max) {
      self.minPeer = min;
      self.maxPeer = max;
    },
    setTime(min, max) {
      self.minTime = min;
      self.maxTime = max;
    },
  };
}).views(/**FilterM*/self => {
  const textToWords = function (text) {
    const result = [];
    const isSpace = /\s/;
    let word = '';
    for (let i = 0, symbol; symbol = text[i]; i++) {
      if (isSpace.test(symbol)) {
        if (text[i - 1] !== '\\') {
          word && result.push(word);
          word = '';
        } else {
          word = word.substr(0, word.length - 1) + symbol;
        }
      } else {
        word += symbol;
      }
    }
    word && result.push(word);
    return result;
  };

  return {
    getTextFilterRe() {
      const text = self.text;
      const words = textToWords(text);
      let i;
      let word = '';
      const includeWords = [];
      const excludeWords = [];
      const excludeRe = /^[!-].+/;
      for (i = 0; word = words[i]; i++) {
        let list = null;
        if (excludeRe.test(word)) {
          list = excludeWords;
          word = word.substr(1);
        } else {
          list = includeWords;
        }
        let wordReStr = escapeRegExp(word);
        if (list.indexOf(wordReStr) === -1) {
          list.push(wordReStr);
        }
      }

      excludeWords.sort(sortByLength);
      includeWords.sort(sortByLength);

      const result = {
        excludeRe: null,
        includeRe: null,
        includeCount: 0
      };
      if (excludeWords.length) {
        result.excludeRe = new RegExp(excludeWords.join('|'), 'i');
      }
      if (includeWords.length) {
        result.includeRe = new RegExp(includeWords.join('|'), 'ig');
        result.includeCount = includeWords.length;
      }
      return result
    },
    testText(text) {
      const textFilter = self.getTextFilterRe();
      if (textFilter.excludeRe && textFilter.excludeRe.test(text)) {
        return false;
      }
      if (textFilter.includeRe) {
        const m = text.match(textFilter.includeRe);
        if (!m || uniq(m).length !== textFilter.includeCount) {
          return false;
        }
      }
      return true;
    },
    testRange(value, min, max) {
      if (min !== 0 && value < min) {
        return false;
      }
      if (max !== 0 && value > max) {
        return false;
      }
      return true;
    },
    processResults(/**TrackerResultM[]*/results) {
      return results.filter(result => {
        if (!self.testRange(result.size, self.minSize, self.maxSize)) {
          return false;
        } else
        if (!self.testRange(result.seed, self.minSeed, self.maxSeed)) {
          return false;
        } else
        if (!self.testRange(result.peer, self.minPeer, self.maxPeer)) {
          return false;
        } else
        if (!self.testRange(result.date, self.minTime, self.maxTime)) {
          return false;
        } else
        if (!self.testText(result.categoryTitle + ' ' + result.title)) {
          return false;
        } else {
          return true;
        }
      });
    },
  };
});

export default filterModel;