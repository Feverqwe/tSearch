import {makeAutoObservable} from 'mobx';

import type SearchResult from './ResultPageItemStore';

export default class FiltersStore {
  text = '';
  resetVersion = 0;
  minSize = 0;
  maxSize = 0;
  minSizeGb = 0;
  maxSizeGb = 0;
  minSeed = 0;
  maxSeed = 0;
  minPeer = 0;
  maxPeer = 0;
  minTime = 0;
  maxTime = 0;
  timePreset = 0;

  private readonly useCategoryWordFilter: () => boolean;

  constructor(useCategoryWordFilter: () => boolean) {
    this.useCategoryWordFilter = useCategoryWordFilter;
    makeAutoObservable<this, 'useCategoryWordFilter'>(
      this,
      {useCategoryWordFilter: false},
      {autoBind: true},
    );
  }
  setText(value: string) {
    this.text = value;
  }
  setSize(min: number, max: number) {
    const factor = 1024 * 1024 * 1024;
    this.minSize = min * factor;
    this.maxSize = max * factor;
    this.minSizeGb = min;
    this.maxSizeGb = max;
  }
  setSeed(min: number, max: number) {
    this.minSeed = min;
    this.maxSeed = max;
  }
  setPeer(min: number, max: number) {
    this.minPeer = min;
    this.maxPeer = max;
  }
  setTime(min: number, max: number, preset = min || max ? -1 : 0) {
    this.minTime = min;
    this.maxTime = max;
    this.timePreset = preset;
  }
  get active() {
    return Boolean(
      this.text ||
      this.minSize ||
      this.maxSize ||
      this.minSeed ||
      this.maxSeed ||
      this.minPeer ||
      this.maxPeer ||
      this.minTime ||
      this.maxTime,
    );
  }

  reset() {
    this.setText('');
    this.setSize(0, 0);
    this.setSeed(0, 0);
    this.setPeer(0, 0);
    this.setTime(0, 0);
    this.resetVersion++;
  }
  private get textFilter() {
    const include = new Set<string>();
    const exclude = new Set<string>();
    for (const word of textToWords(this.text.toLowerCase())) {
      if (word.length > 1 && (word.startsWith('!') || word.startsWith('-'))) {
        exclude.add(word.slice(1));
      } else {
        include.add(word);
      }
    }
    return {include: [...include], exclude: [...exclude]};
  }
  getFilter() {
    const useCategoryWordFilter = this.useCategoryWordFilter();
    const {include, exclude} = this.textFilter;
    return (result: SearchResult) => {
      const date = result.date && result.date > 0 ? result.date : undefined;
      if (
        !testRange(result.size, this.minSize, this.maxSize) ||
        !testRange(result.seeds, this.minSeed, this.maxSeed) ||
        !testRange(result.peers, this.minPeer, this.maxPeer) ||
        !testRange(date, this.minTime, this.maxTime)
      )
        return false;

      const text = useCategoryWordFilter
        ? result.categoryTitleLowerCase + ' ' + result.titleLowerCase
        : result.titleLowerCase;
      return (
        exclude.every((word) => !text.includes(word)) &&
        include.every((word) => text.includes(word))
      );
    };
  }
}

function testRange(value: number | undefined, min: number, max: number) {
  if (!min && !max) return true;
  return (
    value !== undefined &&
    Number.isFinite(value) &&
    (!min || value >= min) &&
    (!max || value <= max)
  );
}

const textToWords = function (text: string) {
  const result = [];
  const isSpace = /\s/;
  let word = '';
  for (let i = 0, symbol; (symbol = text[i]); i++) {
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
