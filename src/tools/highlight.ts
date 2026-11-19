import escapeRegExp from 'lodash.escaperegexp';

import sortByLength from './sortByLength';
import isBoundary from './isBoundary';
import normalizeSearchText from './normalizeSearchText';
import type {TitleMatch} from './titlePresentation';

export type HighlightMap = RegExp | 0;

const highlight = {
  getMap(query: string): HighlightMap {
    const words = normalizeSearchText(query)
      .split(/\s+/)
      .filter(Boolean)
      .map(escapeRegExp)
      .sort(sortByLength);
    return words.length ? new RegExp(words.join('|'), 'ig') : 0;
  },

  getMatches(text: string, map?: HighlightMap): TitleMatch[] {
    if (!map) return [];
    return Array.from(normalizeSearchText(text).matchAll(map)).flatMap(({0: word, index}) =>
      word && isBoundary(text[index - 1], text[index + word.length])
        ? [{start: index, end: index + word.length}]
        : [],
    );
  },
};

export default highlight;
