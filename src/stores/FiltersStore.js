import {getParentOfType, types} from "mobx-state-tree";
import escapeRegExp from "lodash.escaperegexp";
import sortByLength from "../tools/sortByLength";
import uniq from "lodash.uniq";
import getLogger from "../tools/getLogger";
import RootStore from "./RootStore";

const logger = getLogger('searchFrag');


/**
 * @typedef {{}} FiltersStore
 * @property {string} [text]
 * @property {number} [minSize]
 * @property {number} [maxSize]
 * @property {number} [minSeed]
 * @property {number} [maxSeed]
 * @property {number} [minPeer]
 * @property {number} [maxPeer]
 * @property {number} [minTime]
 * @property {number} [maxTime]
 * @property {function} setText
 * @property {function} setSize
 * @property {function} setSeed
 * @property {function} setPeer
 * @property {function} setTime
 * @property {function} getTextFilterRe
 * @property {function} testText
 * @property {function} testRange
 * @property {function} getFilter
 */
const FiltersStore = types.model('FiltersStore', {
  text: types.optional(types.string, ''),
  minSize: types.optional(types.number, 0),
  maxSize: types.optional(types.number, 0),
  minSizeGb: types.optional(types.number, 0),
  maxSizeGb: types.optional(types.number, 0),
  minSeed: types.optional(types.number, 0),
  maxSeed: types.optional(types.number, 0),
  minPeer: types.optional(types.number, 0),
  maxPeer: types.optional(types.number, 0),
  minTime: types.optional(types.number, 0),
  maxTime: types.optional(types.number, 0),
}).actions(/**FiltersStore*/self => {
  return {
    setText(value) {
      self.text = value;
    },
    setSize(min, max) {
      const factor = 1024 * 1024 * 1024;
      self.minSize = min * factor;
      self.maxSize = max * factor;
      self.minSizeGb = min;
      self.minSizeGb = max;
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
}).views(/**FiltersStore*/self => {
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
    get textFilterRe() {
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
    getFilter() {
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      const useCategoryWordFilter = rootStore.options.options.categoryWordFilter;
      return result => {
        if (!testRange(result.size, self.minSize, self.maxSize)) {
          return false;
        } else
        if (!testRange(result.seeds, self.minSeed, self.maxSeed)) {
          return false;
        } else
        if (!testRange(result.peers, self.minPeer, self.maxPeer)) {
          return false;
        } else
        if (!testRange(result.date, self.minTime, self.maxTime)) {
          return false;
        } else {
          let text = null;
          if (useCategoryWordFilter) {
            text = result.categoryTitleLowerCase + ' ' + result.titleLowerCase;
          } else {
            text = result.titleLowerCase
          }
          if (!testText(self.textFilterRe, text)) {
            return false;
          } else {
            return true;
          }
        }
      };
    },
  };
});

const testRange = (value, min, max) => {
  if (min !== 0 && value < min) {
    return false;
  }
  if (max !== 0 && value > max) {
    return false;
  }
  return true;
};

const testText = (textFilter, text) => {
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
};

export default FiltersStore;