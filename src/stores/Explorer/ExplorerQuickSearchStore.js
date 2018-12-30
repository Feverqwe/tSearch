import {applyPatch, flow, getParentOfType, getSnapshot, isAlive, types} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";
import storageGet from "../../tools/storageGet";
import storageSet from "../../tools/storageSet";
import RootStore from "../RootStore";
import isTrailer from "../../tools/isTrailer";
import highlight from "../../tools/highlight";
import {compare} from "fast-json-patch";

const promiseLimit = require('promise-limit');

const logger = getLogger('ExplorerQuickSearchStore');
const oneLimit = promiseLimit(1);

/**
 * @typedef {{}} ExplorerQuickSearchResultStore
 * @property {string} label
 * @property {string} url
 * @property {string} title
 * @property {number} size
 * @property {string} sizeText
 * @property {number} quality
 * @property {*} titleHighlightMap
 */
const ExplorerQuickSearchResultStore = types.model('ExplorerQuickSearchResultStore', {
  label: types.string,
  url: types.string,
  title: types.string,
  size: types.number,
  sizeText: types.string,
  quality: types.number,
}).views((self) => {
  return {
    get titleHighlightMap() {
      const query = getParentOfType(self, ExplorerQuickSearchItemStore);
      return highlight.getTextMap(self.title, query.queryHighlightMap);
    },
  };
});

/**
 * @typedef {{}} ExplorerQuickSearchItemStore
 * @property {string} [state]
 * @property {string} query
 * @property {number} [time]
 * @property {ExplorerQuickSearchResultStore[]} results
 * @property {function} setResults
 * @property {function:Promise} search
 * @property {*} queryHighlightMap
 * @property {*} label
 */
const ExplorerQuickSearchItemStore = types.model('ExplorerQuickSearchItemStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  query: types.identifier,
  time: types.optional(types.number, 0),
  results: types.array(ExplorerQuickSearchResultStore),
}).actions((self) => {
  return {
    setResults(results) {
      self.results = results;
    },
    search: flow(function* () {
      self.state = 'pending';
      try {
        const /**RootStore*/rootStore = getParentOfType(self, RootStore);
        const searchId = rootStore.createSearch(self.query);
        const searchStore = rootStore.getSearch(searchId);
        const joinedResults = [];
        yield Promise.all(rootStore.profiles.prepSelectedTrackerIds.map((trackerId) => {
          const trackerSearch = searchStore.createTrackerSearch(trackerId);
          return trackerSearch.search().then((results) => {
            if (!results) return;

            results.forEach((result) => {
              if (!isTrailer(result.title) && result.size) {
                result.label = result.rate.quality;
                if (result.rate.rate.audioFormat) {
                  result.quality -= result.rate.rate.audioFormat;
                }
                if (
                  result.rate.rate.title >= 80 &&
                  result.rate.rate.wordSpaces >= 50 &&
                  result.rate.rate.caseSens >= 50
                ) {
                  joinedResults.push(result);
                }
              }
            });

            joinedResults.sort(({quality: a}, {quality: b}) => {
              return a === b ? 0 : a > b ? -1 : 1;
            }).splice(5);

            if (isAlive(self)) {
              self.setResults(joinedResults);
            }
          });
        }));
        if (isAlive(self)) {
          rootStore.destroySearch(searchId);
          self.state = 'done';
          if (self.results.length > 0) {
            self.save();
          }
        }
      } catch (err) {
        logger.error('search error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
  };
}).views((self) => {
  return {
    save() {
      const quickSearchStore = getParentOfType(self, ExplorerQuickSearchStore);
      return quickSearchStore.save();
    },
    get queryHighlightMap() {
      return highlight.getMap(self.query);
    },
    get label() {
      let label = '-';
      if (self.results.length) {
        label = self.results[0].label || '+';
      }
      return label;
    }
  };
});

/**
 * @typedef {{}} ExplorerQuickSearchStore
 * @property {string} [state]
 * @property {Map<*,ExplorerQuickSearchItemStore>} quickSearch
 * @property {function} setQuickSearch
 * @property {function:Promise} fetch
 * @property {function} addItem
 * @property {function} removeItem
 * @property {function} save
 * @property {function} getItem
 * @property {function} getQuickSearch
 * @property {function} getQuickSearchSortByTime
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const ExplorerQuickSearchStore = types.model('ExplorerQuickSearchStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  quickSearch: types.map(ExplorerQuickSearchItemStore),
}).actions((self) => {
  return {
    setQuickSearch(value) {
      self.quickSearch = value;
    },
    fetch: flow(function* () {
      self.state = 'pending';
      try {
        const storage = yield storageGet({quickSearch: {}});
        if (isAlive(self)) {
          try {
            self.quickSearch = storage.quickSearch;
          } catch (err) {
            logger.error('set quickSearch error, quickSearch will cleared', err);
            self.quickSearch = {};
          }
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetch error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    addItem(item) {
      self.quickSearch.put(item);

      if (self.quickSearch.size > 150) {
        self.getQuickSearchSortByTime().slice(100).forEach((query) => {
          self.removeItem(query.query);
        });
      }
    },
    removeItem(query) {
      self.quickSearch.delete(query);
    },
    patchQuickSearch(patch) {
      applyPatch(self.quickSearch, patch);
    }
  };
}).views((self) => {
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'local') {
      const change = changes.quickSearch;
      if (change) {
        const diff = compare(self.quickSearch.toJSON(), change.newValue || {});
        self.patchQuickSearch(diff);
      }
    }
  };

  return {
    save() {
      return oneLimit(() => {
        const snapshot = Object.assign({}, getSnapshot(self.quickSearch));
        Object.entries(snapshot).forEach(([key, value]) => {
          if (!value.results.length || value.state === 'pending') {
            delete snapshot[key];
          }
        });
        return storageSet({
          quickSearch: snapshot
        });
      });
    },

    getQuickSearch() {
      return Array.from(self.quickSearch.values());
    },
    getQuickSearchSortByTime() {
      return self.getQuickSearch().sort(({time: a}, {time: b}) => {
        return a === b ? 0 : a > b ? -1 : 1;
      });
    },
    afterCreate() {
      chrome.storage.onChanged.addListener(storageChangeListener);
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    },
  };
});

export default ExplorerQuickSearchStore;
export {ExplorerQuickSearchItemStore};